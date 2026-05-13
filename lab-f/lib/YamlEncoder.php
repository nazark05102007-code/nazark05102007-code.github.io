<?php

namespace App;

class YamlEncoder implements EncoderInterface
{
    public function supports(string $format): bool
    {
        return $format === 'YAML';
    }

    public function decode(string $text, string $format): array
    {
        return yaml_parse($text) ?: [];
    }

    public function encode(array $data, string $format): string
    {
        return yaml_emit($data);
    }
}