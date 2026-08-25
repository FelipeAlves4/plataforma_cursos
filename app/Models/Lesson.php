<?php

namespace App\Models;

use App\Enums\VideoProvider;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'module_id', 'title', 'description', 'video_provider', 'video_id', 'video_url',
    'duration_seconds', 'position', 'is_preview',
])]
class Lesson extends Model
{
    protected function casts(): array
    {
        return [
            'video_provider' => VideoProvider::class,
            'is_preview' => 'boolean',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
