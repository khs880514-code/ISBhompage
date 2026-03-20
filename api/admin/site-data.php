<?php
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    isb_json_response(405, [
        'ok' => false,
        'message' => 'POST 요청만 지원합니다.',
    ]);
}

isb_require_admin_token();

$body = isb_read_json_body();
$data = $body['data'] ?? null;

if (!is_array($data)) {
    isb_json_response(400, [
        'ok' => false,
        'message' => '저장할 데이터 형식이 올바르지 않습니다.',
    ]);
}

try {
    isb_save_site_data($data);
    isb_json_response(200, [
        'ok' => true,
        'message' => '사이트 데이터가 저장되었습니다.',
    ]);
} catch (Throwable $error) {
    isb_json_response(500, [
        'ok' => false,
        'message' => '사이트 데이터를 저장하지 못했습니다.',
    ]);
}
