<?php

namespace App;

class DelimitedEncoder implements EncoderInterface
{
    private array $delimiters = [
        'CSV' => ',',
        'SSV' => ';',
        'TSV' => "\t",
    ];

    public function supports(string $format): bool
    {
        return isset($this->delimiters[$format]);
    }

    public function decode(string $text, string $format): array
    {
        $delimiter = $this->delimiters[$format];

        $lines = array_filter(explode("\n", trim($text)));

        $headers = str_getcsv(array_shift($lines), $delimiter, '"', '\\');

        $result = [];

        foreach ($lines as $line) {
            $values = str_getcsv($line, $delimiter, '"', '\\');
            $result[] = array_combine($headers, $values);
        }

        return $result;
    }

    public function encode(array $data, string $format): string
    {
        if (empty($data)) {
            return '';
        }

        $delimiter = $this->delimiters[$format];

        $headers = array_keys($data[0]);

        $lines = [];

        $lines[] = implode($delimiter, $headers);

        foreach ($data as $row) {
            $lines[] = implode($delimiter, $row);
        }

        return implode("\n", $lines);
    }
}