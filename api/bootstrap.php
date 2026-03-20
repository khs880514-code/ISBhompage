<?php
declare(strict_types=1);

function isb_config(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }

    return $config;
}

function isb_json_response(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function isb_request_token(): string
{
    $headerToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if ($headerToken !== '') {
        return trim($headerToken);
    }

    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($authorization, 'Bearer ') === 0) {
        return trim(substr($authorization, 7));
    }

    return '';
}

function isb_require_admin_token(): void
{
    $providedToken = isb_request_token();
    $expectedHash = (string) (isb_config()['admin_token_sha256'] ?? '');

    if ($providedToken === '' || $expectedHash === '') {
        isb_json_response(401, [
            'ok' => false,
            'message' => '관리자 토큰이 올바르지 않습니다.',
        ]);
    }

    $providedHash = hash('sha256', $providedToken);
    if (!hash_equals($expectedHash, $providedHash)) {
        isb_json_response(401, [
            'ok' => false,
            'message' => '관리자 토큰이 올바르지 않습니다.',
        ]);
    }
}

function isb_read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function isb_ensure_directory(string $path): void
{
    if (is_dir($path)) {
        return;
    }

    if (!mkdir($path, 0775, true) && !is_dir($path)) {
        throw new RuntimeException('디렉터리를 만들지 못했습니다.');
    }
}

function isb_load_site_data(): array
{
    $path = (string) isb_config()['storage_path'];
    if (!is_file($path)) {
        return [];
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function isb_save_site_data(array $data): void
{
    $path = (string) isb_config()['storage_path'];
    isb_ensure_directory(dirname($path));

    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        throw new RuntimeException('사이트 데이터를 JSON으로 변환하지 못했습니다.');
    }

    $tempPath = $path . '.tmp';
    if (file_put_contents($tempPath, $json, LOCK_EX) === false) {
        throw new RuntimeException('사이트 데이터 임시 저장에 실패했습니다.');
    }

    if (!rename($tempPath, $path)) {
        @unlink($tempPath);
        throw new RuntimeException('사이트 데이터를 저장하지 못했습니다.');
    }
}

function isb_sanitize_file_stem(string $value): string
{
    $sanitized = preg_replace('/[^a-z0-9]+/i', '-', strtolower($value)) ?? 'image';
    $sanitized = trim($sanitized, '-');
    return $sanitized !== '' ? substr($sanitized, 0, 40) : 'image';
}

function isb_contains(string $haystack, string $needle): bool
{
    return $needle !== '' && strpos($haystack, $needle) !== false;
}

function isb_extension_from_mime(string $mimeType): string
{
    $normalized = strtolower($mimeType);

    if (isb_contains($normalized, 'jpeg')) {
        return 'jpg';
    }

    if (isb_contains($normalized, 'png')) {
        return 'png';
    }

    if (isb_contains($normalized, 'webp')) {
        return 'webp';
    }

    if (isb_contains($normalized, 'gif')) {
        return 'gif';
    }

    if (isb_contains($normalized, 'avif')) {
        return 'avif';
    }

    if (isb_contains($normalized, 'svg')) {
        return 'svg';
    }

    return 'bin';
}

function isb_build_asset_path(string $fileStem, string $extension): array
{
    $config = isb_config();
    $uploadDirectory = (string) $config['upload_directory'];
    $uploadUrlPrefix = rtrim((string) $config['upload_url_prefix'], '/');
    $datePrefix = date('Y-m-d');
    $fileName = time() . '-' . bin2hex(random_bytes(6)) . '-' . isb_sanitize_file_stem($fileStem) . '.' . $extension;
    $relativeDirectory = $datePrefix;
    $absoluteDirectory = $uploadDirectory . '/' . $relativeDirectory;

    isb_ensure_directory($absoluteDirectory);

    return [
        'absolute_path' => $absoluteDirectory . '/' . $fileName,
        'public_url' => $uploadUrlPrefix . '/' . $relativeDirectory . '/' . $fileName,
    ];
}
