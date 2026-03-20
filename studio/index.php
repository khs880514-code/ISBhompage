<?php
declare(strict_types=1);

$adminHtmlPath = dirname(__DIR__) . '/admin.html';
$html = is_file($adminHtmlPath) ? file_get_contents($adminHtmlPath) : false;

if ($html === false) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Admin UI not found.';
    exit;
}

$html = preg_replace('/<head>/', "<head>\n    <base href=\"/\" />", $html, 1) ?? $html;

header('Content-Type: text/html; charset=utf-8');
echo $html;
