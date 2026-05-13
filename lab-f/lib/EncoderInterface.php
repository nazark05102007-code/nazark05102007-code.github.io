<?php

namespace App;

interface EncoderInterface
{
    public function supports(string $format): bool;

    public function decode(string $text, string $format): array;

    public function encode(array $data, string $format): string;
}