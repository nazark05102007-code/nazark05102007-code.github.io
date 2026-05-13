<?php

namespace App;

class Converter
{
    private array $encoders;

    public function __construct()
    {
        $this->encoders = [
            new DelimitedEncoder(),
            new JsonEncoder(),
            new YamlEncoder(),
        ];
    }

    public function convert(string $input, string $from, string $to): string
    {
        $decoder = $this->findEncoder($from);
        $encoder = $this->findEncoder($to);

        $data = $decoder->decode($input, $from);

        return $encoder->encode($data, $to);
    }

    private function findEncoder(string $format): EncoderInterface
    {
        foreach ($this->encoders as $encoder) {
            if ($encoder->supports($format)) {
                return $encoder;
            }
        }

        throw new Exception('Unsupported format');
    }
}