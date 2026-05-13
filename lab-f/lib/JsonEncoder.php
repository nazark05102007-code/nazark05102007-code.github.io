<?php

namespace App;

class JsonEncoder implements EncoderInterface
{
    public function supports(string $format): bool
    {
        return $format === 'JSON';
    }

    public function decode(string $text, string $format): array
    {
        return json_decode($text, true) ?? [];
    }

    public function encode(array $data, string $format): string
    {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}