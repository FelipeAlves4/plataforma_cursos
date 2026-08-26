<?php

namespace App\Services;

use InvalidArgumentException;

class YouTubeUrlParser
{
    /** @return array{id: string, url: string} */
    public function parse(string $url): array
    {
        $parts = parse_url(trim($url));
        $host = strtolower($parts['host'] ?? '');
        $path = trim($parts['path'] ?? '', '/');

        if (! in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'], true)) {
            throw new InvalidArgumentException('Não conseguimos identificar esse vídeo do YouTube. Confira o link e tente novamente.');
        }

        $id = null;
        if (in_array($host, ['youtu.be', 'www.youtu.be'], true)) {
            $id = explode('/', $path)[0] ?? null;
        } elseif (str_starts_with($path, 'embed/') || str_starts_with($path, 'shorts/')) {
            $id = explode('/', $path)[1] ?? null;
        } elseif ($path === 'watch') {
            parse_str($parts['query'] ?? '', $query);
            $id = $query['v'] ?? null;
        }

        if (! is_string($id) || ! preg_match('/^[A-Za-z0-9_-]{11}$/', $id)) {
            throw new InvalidArgumentException('Não conseguimos identificar esse vídeo do YouTube. Confira o link e tente novamente.');
        }

        return ['id' => $id, 'url' => "https://www.youtube.com/watch?v={$id}"];
    }
}
