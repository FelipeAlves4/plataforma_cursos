<?php

namespace App\Services;

use App\Models\Course;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class MediaStorage
{
    private const string COURSE_COVERS_DISK = 'supabase_course_covers';

    private const string AVATARS_DISK = 'supabase_avatars';

    public function replaceCourseCover(Course $course, UploadedFile $thumbnail): void
    {
        $extension = $thumbnail->extension();
        $storedPath = Storage::disk(self::COURSE_COVERS_DISK)->putFileAs(
            "courses/{$course->id}",
            $thumbnail,
            "cover.{$extension}",
        );

        if ($storedPath === false) {
            throw new RuntimeException('Não foi possível armazenar a capa do curso.');
        }

        $previousPath = $course->thumbnail_path;
        $course->update(['thumbnail_path' => $storedPath]);

        if ($previousPath !== $storedPath) {
            $this->deleteCourseCover($previousPath);
        }
    }

    public function deleteCourseCover(?string $path): void
    {
        $this->deleteManagedPath($path, self::COURSE_COVERS_DISK, $this->isCourseCoverPath(...));
    }

    public function deleteAvatar(?string $path): void
    {
        $this->deleteManagedPath($path, self::AVATARS_DISK, $this->isAvatarPath(...));
    }

    public function courseCoverUrl(?string $path): ?string
    {
        return $this->publicUrl($path, self::COURSE_COVERS_DISK, $this->isCourseCoverPath(...));
    }

    public function avatarUrl(?string $path): ?string
    {
        return $this->publicUrl($path, self::AVATARS_DISK, $this->isAvatarPath(...));
    }

    private function deleteManagedPath(?string $path, string $disk, callable $isManagedPath): void
    {
        if (! $path || ! $isManagedPath($path)) {
            return;
        }

        try {
            if (! Storage::disk($disk)->delete($path)) {
                Log::warning('Não foi possível remover um arquivo do Supabase Storage.', ['path' => $path]);
            }
        } catch (Throwable) {
            Log::warning('Não foi possível remover um arquivo do Supabase Storage.', ['path' => $path]);
        }
    }

    private function publicUrl(?string $path, string $disk, callable $isManagedPath): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk($isManagedPath($path) ? $disk : 'public')->url($path);
    }

    private function isCourseCoverPath(string $path): bool
    {
        return preg_match('/^courses\/\d+\/cover\.(?:gif|jpe?g|png|webp)$/', $path) === 1;
    }

    private function isAvatarPath(string $path): bool
    {
        return preg_match('/^users\/\d+\/avatar\.(?:gif|jpe?g|png|webp)$/', $path) === 1;
    }
}
