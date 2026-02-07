<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$target_dir = "uploads/";

if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (!isset($_FILES["file"])) {
    echo json_encode(["status" => "error", "message" => "No se recibió archivo"]);
    exit;
}

$file = $_FILES["file"];
$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
$allowed_exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $allowed_exts)) {
    echo json_encode(["status" => "error", "message" => "Extensión no permitida"]);
    exit;
}

$filename = time() . "_" . uniqid() . "." . $ext;
$target_file = $target_dir . $filename;

if (move_uploaded_file($file["tmp_name"], $target_file)) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
    
    $url = $protocol . "://" . $host . $path . "/" . $target_file;
    
    echo json_encode(["status" => "success", "url" => $url]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al guardar"]);
}
