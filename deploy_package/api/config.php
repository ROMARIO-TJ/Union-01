<?php
// Configuración de la base de datos para Hostinger
// El usuario deberá cambiar estos valores por los que cree en su panel de Hostinger

// Values below should be replaced with your Hostinger DB credentials.
// For security, set them in the file on the server or use environment variables.
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'DB_USER_HERE');
define('DB_PASS', getenv('DB_PASS') ?: 'DB_PASS_HERE');
define('DB_NAME', getenv('DB_NAME') ?: 'DB_NAME_HERE');

// Habilitar CORS para desarrollo (quitar o restringir en producción)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

function getConn() {
    try {
        $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
    }
}
?>
