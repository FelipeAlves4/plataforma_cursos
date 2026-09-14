<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminDashboardMetricsService
{
    private const ACTIVE_DAYS = 30;

    private const INACTIVE_DAYS = 14;

    /**
     * @return array<string, mixed>
     */
    public function forPeriod(string $period): array
    {
        $range = $this->rangeFor($period);
        $studentTotal = User::query()->where('role', UserRole::Student)->count();
        $currentStudents = $this->studentsCreatedBetween($range['start'], $range['end']);
        $previousStudents = $range['previousStart'] instanceof Carbon
            ? $this->studentsCreatedBetween($range['previousStart'], $range['previousEnd'])
            : null;
        $currentRevenue = $this->paidOrdersBetween($range['start'], $range['end']);
        $previousRevenue = $range['previousStart'] instanceof Carbon
            ? $this->paidOrdersBetween($range['previousStart'], $range['previousEnd'])
            : null;
        $activeStudents = $this->activeStudentsAt($range['end']);
        $previousActiveStudents = $range['previousEnd'] instanceof Carbon
            ? $this->activeStudentsAt($range['previousEnd'])
            : null;
        $completionRate = $this->completionRateAt($range['end']);
        $previousCompletionRate = $range['previousEnd'] instanceof Carbon
            ? $this->completionRateAt($range['previousEnd'])
            : null;
        $studentCourseProgress = $this->studentCourseProgressQuery();

        return [
            'period' => $range['key'],
            'summary' => [
                'students' => [
                    'total' => $studentTotal,
                    'new' => $currentStudents,
                    'change' => $this->percentageChange($currentStudents, $previousStudents),
                ],
                'activeStudents' => [
                    'total' => $activeStudents,
                    'percentage' => $studentTotal > 0 ? round(($activeStudents / $studentTotal) * 100, 1) : 0,
                    'change' => $this->percentageChange($activeStudents, $previousActiveStudents),
                ],
                'revenue' => [
                    'amountCents' => (int) $currentRevenue->sum('amount_cents'),
                    'sales' => $currentRevenue->count(),
                    'change' => $this->percentageChange((int) $currentRevenue->sum('amount_cents'), $previousRevenue ? (int) $previousRevenue->sum('amount_cents') : null),
                ],
                'completionRate' => [
                    'percentage' => $completionRate,
                    'change' => $previousCompletionRate === null ? null : round($completionRate - $previousCompletionRate, 1),
                ],
            ],
            'studentsGrowth' => $this->growthData(
                User::query()->where('role', UserRole::Student),
                'created_at',
                $range
            ),
            'revenueGrowth' => $this->growthData(
                $this->paidOrdersQuery(),
                'paid_at',
                $range,
                'amount_cents'
            ),
            'coursePerformance' => $this->coursePerformance(),
            'engagement' => [
                'active' => $activeStudents,
                'inactive' => max(0, $studentTotal - $activeStudents),
                'notStarted' => (clone $studentCourseProgress)
                    ->where('lesson_count', '>', 0)
                    ->whereNull('started_at')
                    ->count(),
                'atRisk' => (clone $studentCourseProgress)
                    ->where('lesson_count', '>', 0)
                    ->whereNotNull('started_at')
                    ->whereColumn('completed_lessons', '<', 'lesson_count')
                    ->where('last_activity_at', '<=', now()->subDays(self::ACTIVE_DAYS))
                    ->count(),
            ],
            'atRiskStudents' => $this->atRiskStudents($studentCourseProgress),
            'dropoffPoints' => $this->dropoffPoints(),
            'recentActivity' => $this->recentActivity(),
        ];
    }

    /**
     * @return array{key: string, start: Carbon, end: Carbon, previousStart: Carbon|null, previousEnd: Carbon|null, grouping: string}
     */
    private function rangeFor(string $period): array
    {
        $end = now()->endOfDay();
        $start = match ($period) {
            '7d' => now()->subDays(6)->startOfDay(),
            '90d' => now()->subDays(89)->startOfDay(),
            'year' => now()->startOfYear(),
            'all' => Carbon::parse(User::query()->where('role', UserRole::Student)->min('created_at') ?? now()->startOfMonth()),
            default => now()->subDays(29)->startOfDay(),
        };
        $isAllTime = $period === 'all';
        $durationDays = max(1, $start->diffInDays($end) + 1);

        return [
            'key' => in_array($period, ['7d', '30d', '90d', 'year', 'all'], true) ? $period : '30d',
            'start' => $start,
            'end' => $end,
            'previousStart' => $isAllTime ? null : $start->copy()->subDays($durationDays),
            'previousEnd' => $isAllTime ? null : $start->copy()->subSecond(),
            'grouping' => $period === '90d' ? 'week' : ($period === 'year' || $isAllTime ? 'month' : 'day'),
        ];
    }

    private function studentsCreatedBetween(Carbon $start, Carbon $end): int
    {
        return User::query()
            ->where('role', UserRole::Student)
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    private function activeStudentsAt(Carbon $date): int
    {
        return LessonProgress::query()
            ->join((new User)->getTable(), 'users.id', '=', 'lesson_progress.user_id')
            ->where('users.role', UserRole::Student)
            ->whereBetween('lesson_progress.last_accessed_at', [$date->copy()->subDays(self::ACTIVE_DAYS - 1)->startOfDay(), $date])
            ->distinct('lesson_progress.user_id')
            ->count('lesson_progress.user_id');
    }

    private function completionRateAt(Carbon $date): float
    {
        $modulesTable = (new CourseModule)->getTable();
        $lessonsTable = (new Lesson)->getTable();
        $progressTable = (new LessonProgress)->getTable();
        $enrollmentsTable = (new Enrollment)->getTable();

        $courseLessons = CourseModule::query()
            ->join($lessonsTable, "{$modulesTable}.id", '=', "{$lessonsTable}.module_id")
            ->select("{$modulesTable}.course_id")
            ->selectRaw("count({$lessonsTable}.id) as lesson_count")
            ->groupBy("{$modulesTable}.course_id");
        $completedLessons = LessonProgress::query()
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->where("{$progressTable}.completed", true)
            ->whereNotNull("{$progressTable}.completed_at")
            ->where("{$progressTable}.completed_at", '<=', $date)
            ->select("{$modulesTable}.course_id", "{$progressTable}.user_id")
            ->selectRaw("count({$progressTable}.id) as completed_lessons")
            ->groupBy("{$modulesTable}.course_id", "{$progressTable}.user_id");

        $rate = Enrollment::query()
            ->joinSub($courseLessons, 'course_lessons', fn ($join) => $join->on("{$enrollmentsTable}.course_id", '=', 'course_lessons.course_id'))
            ->leftJoinSub($completedLessons, 'completed_lessons', fn ($join) => $join
                ->on("{$enrollmentsTable}.course_id", '=', 'completed_lessons.course_id')
                ->on("{$enrollmentsTable}.user_id", '=', 'completed_lessons.user_id'))
            ->where("{$enrollmentsTable}.enrolled_at", '<=', $date)
            ->selectRaw('avg(coalesce(completed_lessons.completed_lessons, 0) * 100.0 / course_lessons.lesson_count) as percentage')
            ->value('percentage');

        return round((float) ($rate ?? 0), 1);
    }

    private function paidOrdersQuery(): Builder
    {
        return Order::query()
            ->where('status', OrderStatus::Paid)
            ->whereNotNull('checkout_link_id')
            ->whereNotNull('paid_at');
    }

    /** @return Collection<int, Order> */
    private function paidOrdersBetween(Carbon $start, Carbon $end): Collection
    {
        return $this->paidOrdersQuery()->whereBetween('paid_at', [$start, $end])->get(['amount_cents']);
    }

    /**
     * @param  array{start: Carbon, end: Carbon, grouping: string}  $range
     * @return array<int, array{date: string, label: string, value: int}>
     */
    private function growthData(Builder $query, string $column, array $range, ?string $sumColumn = null): array
    {
        $valueExpression = $sumColumn === null ? 'count(*)' : "sum({$sumColumn})";
        $records = $query
            ->whereBetween($column, [$range['start'], $range['end']])
            ->selectRaw("date({$column}) as bucket, {$valueExpression} as value")
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->pluck('value', 'bucket');
        $daily = collect();

        for ($date = $range['start']->copy(); $date->lte($range['end']); $date->addDay()) {
            $key = $date->toDateString();
            $daily->put($key, (int) ($records[$key] ?? 0));
        }

        $grouped = $daily->groupBy(function (int $value, string $date) use ($range): string {
            return match ($range['grouping']) {
                'week' => Carbon::parse($date)->startOfWeek()->toDateString(),
                'month' => Carbon::parse($date)->startOfMonth()->toDateString(),
                default => $date,
            };
        })->map(fn (Collection $values): int => $values->sum());

        return $grouped->map(fn (int $value, string $date): array => [
            'date' => $date,
            'label' => match ($range['grouping']) {
                'month' => Carbon::parse($date)->translatedFormat('M/Y'),
                'week' => 'Semana de '.Carbon::parse($date)->format('d/m'),
                default => Carbon::parse($date)->format('d/m'),
            },
            'value' => $value,
        ])->values()->all();
    }

    /** @return array<int, array<string, int|string>> */
    private function coursePerformance(): array
    {
        $courses = Course::query()->withCount(['enrollments', 'lessons'])->orderByDesc('enrollments_count')->orderBy('title')->limit(5)->get(['id', 'title']);
        $courseIds = $courses->pluck('id');

        if ($courseIds->isEmpty()) {
            return [];
        }

        $enrollmentsTable = (new Enrollment)->getTable();
        $modulesTable = (new CourseModule)->getTable();
        $lessonsTable = (new Lesson)->getTable();
        $progressTable = (new LessonProgress)->getTable();
        $progressByCourse = Enrollment::query()
            ->join($modulesTable, "{$enrollmentsTable}.course_id", '=', "{$modulesTable}.course_id")
            ->join($lessonsTable, "{$modulesTable}.id", '=', "{$lessonsTable}.module_id")
            ->leftJoin($progressTable, function ($join) use ($enrollmentsTable, $lessonsTable, $progressTable): void {
                $join->on("{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
                    ->on("{$progressTable}.user_id", '=', "{$enrollmentsTable}.user_id");
            })
            ->whereIn("{$enrollmentsTable}.course_id", $courseIds)
            ->select("{$enrollmentsTable}.course_id")
            ->selectRaw("count(distinct case when {$progressTable}.started_at is not null then {$enrollmentsTable}.user_id end) as started_students")
            ->selectRaw("sum(case when {$progressTable}.completed = 1 then 1 else 0 end) as completed_lessons")
            ->groupBy("{$enrollmentsTable}.course_id")
            ->get()
            ->keyBy('course_id');
        $studentProgress = Enrollment::query()
            ->join($modulesTable, "{$enrollmentsTable}.course_id", '=', "{$modulesTable}.course_id")
            ->join($lessonsTable, "{$modulesTable}.id", '=', "{$lessonsTable}.module_id")
            ->leftJoin($progressTable, function ($join) use ($enrollmentsTable, $lessonsTable, $progressTable): void {
                $join->on("{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
                    ->on("{$progressTable}.user_id", '=', "{$enrollmentsTable}.user_id");
            })
            ->whereIn("{$enrollmentsTable}.course_id", $courseIds)
            ->select("{$enrollmentsTable}.course_id", "{$enrollmentsTable}.user_id")
            ->selectRaw("count({$lessonsTable}.id) as lesson_count")
            ->selectRaw("sum(case when {$progressTable}.completed = 1 then 1 else 0 end) as completed_lessons")
            ->groupBy("{$enrollmentsTable}.course_id", "{$enrollmentsTable}.user_id");
        $completedStudents = DB::query()
            ->fromSub($studentProgress, 'student_progress')
            ->whereColumn('completed_lessons', '>=', 'lesson_count')
            ->select('course_id')
            ->selectRaw('count(*) as completed_students')
            ->groupBy('course_id')
            ->pluck('completed_students', 'course_id');

        return $courses->map(function (Course $course) use ($progressByCourse, $completedStudents): array {
            $stats = $progressByCourse->get($course->id);
            $students = (int) $course->enrollments_count;
            $lessons = (int) $course->lessons_count;
            $completedLessons = (int) ($stats?->completed_lessons ?? 0);
            $completed = (int) ($completedStudents[$course->id] ?? 0);

            return [
                'id' => $course->id,
                'title' => $course->title,
                'students' => $students,
                'started' => (int) ($stats?->started_students ?? 0),
                'completed' => $completed,
                'completionRate' => $students > 0 ? (int) round(($completed / $students) * 100) : 0,
                'averageProgress' => $students > 0 && $lessons > 0 ? (int) round(($completedLessons / ($students * $lessons)) * 100) : 0,
            ];
        })->all();
    }

    private function studentCourseProgressQuery(): Builder
    {
        $enrollmentsTable = (new Enrollment)->getTable();
        $modulesTable = (new CourseModule)->getTable();
        $lessonsTable = (new Lesson)->getTable();
        $progressTable = (new LessonProgress)->getTable();

        return Enrollment::query()
            ->join('users', 'users.id', '=', "{$enrollmentsTable}.user_id")
            ->join('courses', 'courses.id', '=', "{$enrollmentsTable}.course_id")
            ->leftJoin($modulesTable, "{$enrollmentsTable}.course_id", '=', "{$modulesTable}.course_id")
            ->leftJoin($lessonsTable, "{$modulesTable}.id", '=', "{$lessonsTable}.module_id")
            ->leftJoin($progressTable, function ($join) use ($enrollmentsTable, $lessonsTable, $progressTable): void {
                $join->on("{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
                    ->on("{$progressTable}.user_id", '=', "{$enrollmentsTable}.user_id");
            })
            ->where('users.role', UserRole::Student)
            ->select("{$enrollmentsTable}.id as enrollment_id", "{$enrollmentsTable}.enrolled_at", 'users.id as user_id', 'users.name as user_name', 'courses.id as course_id', 'courses.title as course_title')
            ->selectRaw("count({$lessonsTable}.id) as lesson_count")
            ->selectRaw("sum(case when {$progressTable}.completed = 1 then 1 else 0 end) as completed_lessons")
            ->selectRaw("min({$progressTable}.started_at) as started_at")
            ->selectRaw("max({$progressTable}.last_accessed_at) as last_activity_at")
            ->groupBy("{$enrollmentsTable}.id", "{$enrollmentsTable}.enrolled_at", 'users.id', 'users.name', 'courses.id', 'courses.title');
    }

    /**
     * @return array<int, array<string, int|string|null>>
     */
    private function atRiskStudents(Builder $studentCourseProgress): array
    {
        $attentionThreshold = now()->subDays(self::INACTIVE_DAYS);
        $riskThreshold = now()->subDays(self::ACTIVE_DAYS);

        return DB::query()->fromSub($studentCourseProgress, 'course_progress')
            ->where('lesson_count', '>', 0)
            ->where(function ($query) use ($attentionThreshold): void {
                $query->whereNull('started_at')
                    ->orWhere('last_activity_at', '<=', $attentionThreshold)
                    ->orWhere(function ($query) use ($attentionThreshold): void {
                        $query->where('enrolled_at', '<=', $attentionThreshold)
                            ->whereRaw('completed_lessons * 100 < lesson_count * 10');
                    });
            })
            ->orderByRaw('case when started_at is null then 0 when last_activity_at <= ? then 1 else 2 end', [$riskThreshold])
            ->orderBy('last_activity_at')
            ->limit(10)
            ->get()
            ->map(function (object $student) use ($attentionThreshold, $riskThreshold): array {
                $progress = $student->lesson_count > 0 ? (int) round(($student->completed_lessons / $student->lesson_count) * 100) : 0;
                $status = match (true) {
                    $student->started_at === null => 'Não iniciou',
                    $student->enrolled_at <= $attentionThreshold->toDateTimeString() && $progress < 10 => 'Baixo progresso',
                    $student->last_activity_at <= $riskThreshold->toDateTimeString() => 'Risco de abandono',
                    default => 'Inativo',
                };

                return [
                    'userId' => (int) $student->user_id,
                    'name' => $student->user_name,
                    'courseId' => (int) $student->course_id,
                    'course' => $student->course_title,
                    'progress' => $progress,
                    'lastActivityAt' => $student->last_activity_at,
                    'status' => $status,
                ];
            })->all();
    }

    /** @return array<int, array<string, int|string>> */
    private function dropoffPoints(): array
    {
        $modulesTable = (new CourseModule)->getTable();
        $lessonsTable = (new Lesson)->getTable();
        $progressTable = (new LessonProgress)->getTable();
        $arrivalCounts = LessonProgress::query()
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->select("{$modulesTable}.course_id", "{$lessonsTable}.id as lesson_id")
            ->selectRaw("count(distinct {$progressTable}.user_id) as arrived_students")
            ->groupBy("{$modulesTable}.course_id", "{$lessonsTable}.id")
            ->get()
            ->keyBy(fn (object $row): string => "{$row->course_id}:{$row->lesson_id}");
        $latestActivity = LessonProgress::query()
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->whereNotNull("{$progressTable}.last_accessed_at")
            ->select("{$modulesTable}.course_id", "{$progressTable}.user_id")
            ->selectRaw("max({$progressTable}.last_accessed_at) as last_activity_at")
            ->groupBy("{$modulesTable}.course_id", "{$progressTable}.user_id");
        $courseLessons = CourseModule::query()
            ->join($lessonsTable, "{$modulesTable}.id", '=', "{$lessonsTable}.module_id")
            ->select("{$modulesTable}.course_id")
            ->selectRaw("count({$lessonsTable}.id) as lesson_count")
            ->groupBy("{$modulesTable}.course_id");
        $completedLessons = LessonProgress::query()
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->where("{$progressTable}.completed", true)
            ->select("{$modulesTable}.course_id", "{$progressTable}.user_id")
            ->selectRaw("count({$progressTable}.id) as completed_lessons")
            ->groupBy("{$modulesTable}.course_id", "{$progressTable}.user_id");

        return LessonProgress::query()
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->joinSub($latestActivity, 'latest_activity', function ($join) use ($modulesTable, $progressTable): void {
                $join->on('latest_activity.course_id', '=', "{$modulesTable}.course_id")
                    ->on('latest_activity.user_id', '=', "{$progressTable}.user_id")
                    ->on('latest_activity.last_activity_at', '=', "{$progressTable}.last_accessed_at");
            })
            ->joinSub($courseLessons, 'course_lessons', fn ($join) => $join->on('course_lessons.course_id', '=', "{$modulesTable}.course_id"))
            ->leftJoinSub($completedLessons, 'completed_lessons', function ($join) use ($modulesTable, $progressTable): void {
                $join->on('completed_lessons.course_id', '=', "{$modulesTable}.course_id")
                    ->on('completed_lessons.user_id', '=', "{$progressTable}.user_id");
            })
            ->where("{$progressTable}.last_accessed_at", '<=', now()->subDays(self::INACTIVE_DAYS))
            ->whereRaw('coalesce(completed_lessons.completed_lessons, 0) < course_lessons.lesson_count')
            ->select("{$modulesTable}.course_id", "{$lessonsTable}.id as lesson_id", "{$lessonsTable}.title as lesson_title", "{$modulesTable}.title as module_title")
            ->selectRaw("count(distinct {$progressTable}.user_id) as stalled_students")
            ->groupBy("{$modulesTable}.course_id", "{$lessonsTable}.id", "{$lessonsTable}.title", "{$modulesTable}.title")
            ->get()
            ->map(function (object $point) use ($arrivalCounts): array {
                $arrived = (int) ($arrivalCounts["{$point->course_id}:{$point->lesson_id}"]->arrived_students ?? 0);
                $stalled = (int) $point->stalled_students;

                return [
                    'lesson' => "{$point->module_title} · {$point->lesson_title}",
                    'arrived' => $arrived,
                    'stalled' => $stalled,
                    'rate' => $arrived > 0 ? (int) round(($stalled / $arrived) * 100) : 0,
                ];
            })
            ->sortByDesc('rate')
            ->take(5)
            ->values()
            ->all();
    }

    /** @return array<int, array<string, int|string|null>> */
    private function recentActivity(): array
    {
        $enrollments = Enrollment::query()->with(['user:id,name', 'course:id,title'])->latest('enrolled_at')->limit(5)->get()
            ->map(fn (Enrollment $enrollment): array => ['id' => "enrollment-{$enrollment->id}", 'type' => 'enrollment', 'title' => "{$enrollment->user->name} entrou em {$enrollment->course->title}", 'occurredAt' => $enrollment->enrolled_at?->toDateTimeString()]);
        $lessonProgress = LessonProgress::query()->with(['user:id,name', 'lesson.module.course:id,title'])->whereNotNull('started_at')->latest('started_at')->limit(5)->get()
            ->map(fn (LessonProgress $progress): array => ['id' => "progress-{$progress->id}", 'type' => $progress->completed_at ? 'completion' : 'started', 'title' => $progress->completed_at ? "{$progress->user->name} concluiu a aula {$progress->lesson->title}" : "{$progress->user->name} iniciou {$progress->lesson->module->course->title}", 'occurredAt' => ($progress->completed_at ?? $progress->started_at)?->toDateTimeString()]);
        $sales = $this->paidOrdersQuery()->with('user:id,name')->latest('paid_at')->limit(5)->get()
            ->map(fn (Order $order): array => ['id' => "sale-{$order->id}", 'type' => 'sale', 'title' => 'Nova venda de R$ '.number_format($order->amount_cents / 100, 2, ',', '.')." para {$order->user?->name}", 'occurredAt' => $order->paid_at?->toDateTimeString()]);
        $students = User::query()->where('role', UserRole::Student)->latest()->limit(5)->get()
            ->map(fn (User $student): array => ['id' => "student-{$student->id}", 'type' => 'student', 'title' => "{$student->name} entrou na plataforma", 'occurredAt' => $student->created_at?->toDateTimeString()]);

        return $enrollments->concat($lessonProgress)->concat($sales)->concat($students)
            ->filter(fn (array $activity): bool => $activity['occurredAt'] !== null)
            ->sortByDesc('occurredAt')
            ->unique('id')
            ->take(10)
            ->values()
            ->all();
    }

    private function percentageChange(int $current, ?int $previous): ?float
    {
        if ($previous === null || $previous === 0) {
            return null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
