<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use App\Services\CertificateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class CertificateController extends Controller
{
    public function index(Request $request, CertificateService $certificates): InertiaResponse
    {
        $user = $request->user();

        return Inertia::render('Certificates/Index', [
            'certificates' => $user->certificates()
                ->latest('issued_at')
                ->get()
                ->map(fn (Certificate $certificate): array => $this->certificateData($certificate)),
            'availableCourses' => $certificates->eligibleCourses($user)
                ->map(fn (Course $course): array => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'issueUrl' => route('courses.certificate.store', $course),
                ]),
        ]);
    }

    public function store(Request $request, Course $course, CertificateService $certificates): RedirectResponse
    {
        $certificate = $certificates->findOrIssue($request->user(), $course);

        abort_unless($certificate, 403);

        return to_route('certificates.index')->with('success', 'Certificado emitido com sucesso.');
    }

    public function download(Request $request, Certificate $certificate): Response
    {
        $this->authorize('view', $certificate);

        return Pdf::loadView('certificates.pdf', [
            'certificate' => $certificate,
            'verificationUrl' => route('certificates.verify', $certificate->verification_code),
            'workloadLabel' => $this->formatWorkload($certificate->workload_minutes),
        ])
            ->setPaper('a4', 'landscape')
            ->download("certificado-{$certificate->certificate_number}.pdf");
    }

    public function verify(string $verificationCode): InertiaResponse
    {
        $certificate = Certificate::query()
            ->where('verification_code', $verificationCode)
            ->first();

        return Inertia::render('Certificates/Verify', [
            'certificate' => $certificate ? [
                'courseTitle' => $certificate->course_title,
                'completedAt' => $certificate->completed_at->toDateString(),
                'issuedAt' => $certificate->issued_at->toDateString(),
                'number' => $certificate->certificate_number,
                'recipientName' => $certificate->recipient_name,
                'workloadMinutes' => $certificate->workload_minutes,
            ] : null,
        ]);
    }

    /**
     * @return array{courseTitle: string, completedAt: string, downloadUrl: string, issuedAt: string, number: string, recipientName: string, verificationUrl: string, workloadMinutes: int|null}
     */
    private function certificateData(Certificate $certificate): array
    {
        return [
            'courseTitle' => $certificate->course_title,
            'completedAt' => $certificate->completed_at->toDateString(),
            'downloadUrl' => route('certificates.download', $certificate),
            'issuedAt' => $certificate->issued_at->toDateString(),
            'number' => $certificate->certificate_number,
            'recipientName' => $certificate->recipient_name,
            'verificationUrl' => route('certificates.verify', $certificate->verification_code),
            'workloadMinutes' => $certificate->workload_minutes,
        ];
    }

    private function formatWorkload(?int $minutes): ?string
    {
        if (! $minutes) {
            return null;
        }

        if ($minutes < 60) {
            return "{$minutes} min";
        }

        $hours = intdiv($minutes, 60);
        $remainingMinutes = $minutes % 60;
        $hoursLabel = $hours === 1 ? '1 hora' : "{$hours} horas";

        return $remainingMinutes ? "{$hoursLabel} e {$remainingMinutes} min" : $hoursLabel;
    }
}
