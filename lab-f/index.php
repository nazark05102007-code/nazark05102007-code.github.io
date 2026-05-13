<?php

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/lib/';

    if (str_starts_with($class, $prefix)) {
        $relative = substr($class, strlen($prefix));
        $file = $baseDir . str_replace('\\', '/', $relative) . '.php';

        if (file_exists($file)) {
            require $file;
        }
    }
});

use App\Converter;

$formats = ['CSV', 'SSV', 'TSV', 'JSON', 'YAML'];

$input = $_POST['input'] ?? $_COOKIE['input'] ?? '';
$from = $_POST['from'] ?? $_COOKIE['from'] ?? 'TSV';
$to = $_POST['to'] ?? $_COOKIE['to'] ?? 'JSON';
$output = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    setcookie('input', $input, time() + 3600 * 24 * 30);
    setcookie('from', $from, time() + 3600 * 24 * 30);
    setcookie('to', $to, time() + 3600 * 24 * 30);

    try {
        $converter = new Converter();
        $output = $converter->convert($input, $from, $to);
    } catch (Throwable $e) {
        $output = 'Error: ' . $e->getMessage();
    }
}

function selected(string $a, string $b): string
{
    return $a === $b ? 'selected' : '';
}

?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Konwerter danych</title>
</head>
<body>
<h1>Konwerter danych</h1>

<form method="post">
    <label>Dane wejściowe:</label><br>
    <textarea name="input" rows="12" cols="80"><?= htmlspecialchars($input) ?></textarea>

    <br><br>

    <label>Format wejściowy:</label>
    <select name="from">
        <?php foreach ($formats as $format): ?>
            <option value="<?= $format ?>" <?= selected($from, $format) ?>>
                <?= $format ?>
            </option>
        <?php endforeach; ?>
    </select>

    <label>Format wyjściowy:</label>
    <select name="to">
        <?php foreach ($formats as $format): ?>
            <option value="<?= $format ?>" <?= selected($to, $format) ?>>
                <?= $format ?>
            </option>
        <?php endforeach; ?>
    </select>

    <br><br>

    <button type="submit">Konwertuj</button>
</form>

<h2>Wynik:</h2>
<pre><?= htmlspecialchars($output) ?></pre>

</body>
</html>