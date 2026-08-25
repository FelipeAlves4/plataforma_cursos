<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function view(User $user, Lesson $lesson): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $lesson->loadMissing('module.course');
        $course = $lesson->module->course;

        return $course->isPublished()
            && $course->enrollments()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->isAdmin();
    }
}
