<?php

$data = [
    'name' => 'Nazar',
    'index' => '57708',
    'date' => date(DATE_ATOM),
];

$yaml = yaml_emit($data);

echo $yaml;