<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; size: A4 landscape; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #26143d; font-family: DejaVu Sans, sans-serif; }
        .sheet { background: #fbf8f2; border: 13px solid #4a177c; height: 210mm; padding: 14mm; position: relative; width: 297mm; }
        .inner { border: 1px solid #bda0dd; height: 100%; padding: 16mm 20mm; text-align: center; }
        .logo { height: 17mm; margin-bottom: 11mm; max-width: 60mm; object-fit: contain; }
        .eyebrow { color: #7224ad; font-size: 11pt; font-weight: bold; letter-spacing: 3px; margin: 0; text-transform: uppercase; }
        h1 { color: #3f136b; font-family: DejaVu Serif, serif; font-size: 35pt; letter-spacing: 2px; margin: 7mm 0 11mm; }
        p { font-size: 13pt; line-height: 1.65; margin: 0; }
        .recipient { color: #4a177c; font-family: DejaVu Serif, serif; font-size: 29pt; font-weight: bold; margin: 8mm auto; max-width: 220mm; }
        .course { color: #4a177c; font-family: DejaVu Serif, serif; font-size: 21pt; font-weight: bold; margin: 4mm auto 8mm; max-width: 220mm; }
        .details { color: #634e70; font-size: 11pt; margin-top: 2mm; }
        .footer { bottom: 19mm; color: #654573; font-size: 9.5pt; left: 34mm; position: absolute; right: 34mm; }
        .footer td { vertical-align: bottom; width: 50%; }
        .number { color: #4a177c; font-weight: bold; margin-top: 2mm; }
        .verification { font-size: 8pt; line-height: 1.45; text-align: right; word-break: break-all; }
    </style>
</head>
<body>
    <main class="sheet">
        <section class="inner">
            <img class="logo" src="{{ public_path('brand/asex-educacao-logo-horizontal.png') }}" alt="ASEX Educação">
            <p class="eyebrow">Certificado de conclusão</p>
            <h1>CERTIFICADO</h1>
            <p>A ASEX Educação certifica que</p>
            <p class="recipient">{{ $certificate->recipient_name }}</p>
            <p>concluiu o curso</p>
            <p class="course">{{ $certificate->course_title }}</p>
            @if ($workloadLabel)
                <p class="details">com carga horária de {{ $workloadLabel }}</p>
            @endif
            <p class="details">concluído em {{ $certificate->completed_at->translatedFormat('d \d\e F \d\e Y') }}.</p>
            @if ($certificate->instructor_name)
                <p class="details">Instrutor: {{ $certificate->instructor_name }}</p>
            @endif
        </section>
        <table class="footer">
            <tr>
                <td>
                    <strong>ASEX Educação</strong>
                    <div class="number">Certificado: {{ $certificate->certificate_number }}</div>
                </td>
                <td class="verification">
                    Verificação pública:<br>
                    {{ $verificationUrl }}
                </td>
            </tr>
        </table>
    </main>
</body>
</html>
