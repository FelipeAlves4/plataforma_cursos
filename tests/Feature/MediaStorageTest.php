<?php

namespace Tests\Feature;

use App\Services\MediaStorage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class MediaStorageTest extends TestCase
{
    public function test_it_resolves_new_course_covers_to_the_stable_public_url(): void
    {
        config([
            'filesystems.disks.supabase_course_covers.key' => 'test-access-key',
            'filesystems.disks.supabase_course_covers.secret' => 'test-secret-key',
            'filesystems.disks.supabase_course_covers.region' => 'sa-east-1',
            'filesystems.disks.supabase_course_covers.endpoint' => 'https://phiusuldjlpyvvprzveq.storage.supabase.co/storage/v1/s3',
            'filesystems.disks.supabase_course_covers.url' => 'https://phiusuldjlpyvvprzveq.supabase.co/storage/v1/object/public/course-covers',
        ]);

        $path = 'courses/12/cover.webp';

        $this->assertSame(
            'https://phiusuldjlpyvvprzveq.supabase.co/storage/v1/object/public/course-covers/courses/12/cover.webp',
            app(MediaStorage::class)->courseCoverUrl($path),
        );
    }

    public function test_it_preserves_legacy_urls_and_resolves_legacy_local_paths(): void
    {
        Storage::fake('public');
        $mediaStorage = app(MediaStorage::class);
        $legacyPath = 'courses/12/original-cover.png';

        $this->assertSame('https://cdn.example.com/course-cover.png', $mediaStorage->courseCoverUrl('https://cdn.example.com/course-cover.png'));
        $this->assertSame(Storage::disk('public')->url($legacyPath), $mediaStorage->courseCoverUrl($legacyPath));
    }

    public function test_it_deletes_only_managed_supabase_course_covers(): void
    {
        Storage::fake('supabase_course_covers');
        Storage::fake('public');
        $mediaStorage = app(MediaStorage::class);
        $managedPath = 'courses/12/cover.png';
        $legacyPath = 'courses/12/original-cover.png';
        Storage::disk('supabase_course_covers')->put($managedPath, 'managed');
        Storage::disk('public')->put($legacyPath, 'legacy');

        $mediaStorage->deleteCourseCover($managedPath);
        $mediaStorage->deleteCourseCover($legacyPath);

        Storage::disk('supabase_course_covers')->assertMissing($managedPath);
        Storage::disk('public')->assertExists($legacyPath);
    }

    public function test_it_keeps_the_main_operation_safe_when_supabase_deletion_fails(): void
    {
        Log::spy();
        Storage::shouldReceive('disk')
            ->once()
            ->with('supabase_course_covers')
            ->andThrow(new RuntimeException('Storage unavailable.'));

        app(MediaStorage::class)->deleteCourseCover('courses/12/cover.png');

        Log::shouldHaveReceived('warning')->once();
    }
}
