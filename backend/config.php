<?php
// Configuración de la base de datos para Hostinger
// El usuario deberá cambiar estos valores por los que cree en su panel de Hostinger

define('DB_HOST', 'localhost');
define('DB_USER', 'u671193113_union_user'); // Usuario real de Hostinger
define('DB_PASS', 'Anasophia302304');   // Cambiar por el password de DB
define('DB_NAME', 'u671193113_union_db');  // Base de datos real de Hostinger

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
