<?php

namespace Tests\Unit;

use App\Services\YouTubeUrlParser;
use InvalidArgumentException;
use Tests\TestCase;

class YouTubeUrlParserTest extends TestCase
{
    public function test_it_normalizes_supported_youtube_urls(): void
    {
        $parser = app(YouTubeUrlParser::class);

        foreach ([
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'https://youtu.be/dQw4w9WgXcQ',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
        ] as $url) {
            $this->assertSame('dQw4w9WgXcQ', $parser->parse($url)['id']);
        }
    }

    public function test_it_rejects_invalid_urls(): void
    {
        $this->expectException(InvalidArgumentException::class);
        app(YouTubeUrlParser::class)->parse('https://example.com/video');
    }
}
