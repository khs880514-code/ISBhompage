<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

isb_json_response(200, [
    'ok' => true,
    'data' => isb_load_site_data(),
]);
