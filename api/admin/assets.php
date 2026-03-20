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

$config = isb_config();
$maxUploadBytes = (int) ($config['max_upload_bytes'] ?? 0);

try {
    if (isset($_FILES['file']) && is_array($_FILES['file'])) {
        $file = $_FILES['file'];

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            isb_json_response(400, [
                'ok' => false,
                'message' => '이미지 업로드에 실패했습니다.',
            ]);
        }

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0) {
            isb_json_response(400, [
                'ok' => false,
                'message' => '비어 있는 파일은 업로드할 수 없습니다.',
            ]);
        }

        if ($maxUploadBytes > 0 && $size > $maxUploadBytes) {
            isb_json_response(413, [
                'ok' => false,
                'message' => '이미지 한 장이 너무 큽니다. 7MB 안쪽 파일을 사용해주세요.',
            ]);
        }

        $mimeType = (string) mime_content_type((string) $file['tmp_name']);
        if (strpos($mimeType, 'image/') !== 0) {
            isb_json_response(400, [
                'ok' => false,
                'message' => '이미지 파일만 업로드할 수 있습니다.',
            ]);
        }

        $pathInfo = isb_build_asset_path((string) ($file['name'] ?? 'image'), isb_extension_from_mime($mimeType));
        if (!move_uploaded_file((string) $file['tmp_name'], $pathInfo['absolute_path'])) {
            throw new RuntimeException('업로드 파일 저장에 실패했습니다.');
        }

        isb_json_response(200, [
            'ok' => true,
            'url' => $pathInfo['public_url'],
            'size' => $size,
        ]);
    }

    $body = isb_read_json_body();
    $dataUrl = is_string($body['dataUrl'] ?? null) ? $body['dataUrl'] : '';
    $fileName = is_string($body['fileName'] ?? null) ? $body['fileName'] : 'image';

    if (!preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s', $dataUrl, $matches)) {
        isb_json_response(400, [
            'ok' => false,
            'message' => '업로드할 이미지 데이터가 없습니다.',
        ]);
    }

    $mimeType = $matches[1];
    $binary = base64_decode($matches[2], true);
    if ($binary === false || $binary === '') {
        isb_json_response(400, [
            'ok' => false,
            'message' => '이미지 데이터를 해석하지 못했습니다.',
        ]);
    }

    $size = strlen($binary);
    if ($maxUploadBytes > 0 && $size > $maxUploadBytes) {
        isb_json_response(413, [
            'ok' => false,
            'message' => '이미지 한 장이 너무 큽니다. 7MB 안쪽 파일을 사용해주세요.',
        ]);
    }

    $pathInfo = isb_build_asset_path($fileName, isb_extension_from_mime($mimeType));
    if (file_put_contents($pathInfo['absolute_path'], $binary, LOCK_EX) === false) {
        throw new RuntimeException('이미지 데이터를 저장하지 못했습니다.');
    }

    isb_json_response(200, [
        'ok' => true,
        'url' => $pathInfo['public_url'],
        'size' => $size,
    ]);
} catch (Throwable $error) {
    isb_json_response(500, [
        'ok' => false,
        'message' => '이미지 업로드 중 오류가 발생했습니다.',
    ]);
}
