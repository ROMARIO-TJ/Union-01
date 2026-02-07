<?php
// Script para manejar la subida de archivos (Fotos y PDFs)

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Only POST allowed"]);
    exit;
}

if (!isset($_FILES['file'])) {
    echo json_encode(["status" => "error", "message" => "No file uploaded"]);
    exit;
}

$targetDir = "uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$file = $_FILES['file'];
$fileName = time() . "_" . basename($file["name"]);
$targetFile = $targetDir . $fileName;
$fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));

// Validar extensiones
$allowed = ['jpg', 'jpeg', 'png', 'pdf'];
if (!in_array($fileType, $allowed)) {
    echo json_encode(["status" => "error", "message" => "FileType not allowed"]);
    exit;
}

if (move_uploaded_file($file["tmp_name"], $targetFile)) {
    // Retornar la URL del archivo
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = str_replace(basename($_SERVER['PHP_SELF']), '', $_SERVER['PHP_SELF']);
    $fileUrl = $protocol . "://" . $host . $path . $targetFile;
    
    echo json_encode(["status" => "success", "url" => $fileUrl]);
} else {
    echo json_encode(["status" => "error", "message" => "Upload failed"]);
}
?>
