<?php
header('Content-Type: application/json');
// Forzar error reporting a JSON
error_reporting(0);
ini_set('display_errors', 0);

set_exception_handler(function($e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Error Crítico: ' . $e->getMessage()]);
    exit;
});

if (!file_exists('db_connect.php')) {
    throw new Exception("El archivo db_connect.php no existe en la carpeta api/");
}

require_once 'db_connect.php';

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

// Soporte para servidores que bloquean DELETE/PUT/PATCH
// Se puede enviar el método real en la URL o en el JSON como '_method'
$method = $_SERVER['REQUEST_METHOD'];
if (isset($_GET['_method'])) $method = strtoupper($_GET['_method']);
if (isset($input['_method'])) $method = strtoupper($input['_method']);

$id = $_GET['id'] ?? null;
if (!$id && isset($input['id'])) {
    $id = $input['id'];
}

function response($status, $data = null) {
    echo json_encode(['status' => $status, 'data' => $data]);
    exit;
}

function success($msg = "Operación exitosa") {
    echo json_encode(['status' => 'success', 'message' => $msg]);
    exit;
}

switch ($action) {
    case 'news':
        handleCrud($pdo, 'news', $method, $id, $input);
        break;
    case 'matches':
        handleCrud($pdo, 'matches', $method, $id, $input);
        break;
    case 'categories':
        handleCrud($pdo, 'categories', $method, $id, $input);
        break;
    case 'benefits':
        handleCrud($pdo, 'benefits', $method, $id, $input);
        break;
    case 'players':
        handlePlayers($pdo, $method, $id, $input);
        break;
    case 'sponsors':
        handleCrud($pdo, 'sponsors', $method, $id, $input);
        break;
    case 'gallery':
        handleCrud($pdo, 'gallery', $method, $id, $input);
        break;
    case 'settings':
        handleSettings($pdo, $method, $input);
        break;
    default:
        response('error', 'Acción no válida: ' . $action);
}

function handleCrud($pdo, $table, $method, $id, $input) {
    try {
        if ($method === 'GET') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
                $stmt->execute([$id]);
                $res = $stmt->fetch();
                echo json_encode($res ? $res : []);
            } else {
                $stmt = $pdo->query("SELECT * FROM $table ORDER BY id DESC");
                echo json_encode($stmt->fetchAll());
            }
        } 
        elseif ($method === 'POST') {
            if (!$input) response('error', 'No se recibieron datos (JSON inválido)');
            // Limpiar campos que no deben ir en el INSERT (como id si es auto-increment)
            unset($input['id']);
            
            $keys = array_keys($input);
            $fields = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
            $placeholders = implode(',', array_fill(0, count($keys), '?'));
            
            $stmt = $pdo->prepare("INSERT INTO $table ($fields) VALUES ($placeholders)");
            $stmt->execute(array_values($input));
            success("Registro creado correctamente");
        } 
        elseif ($method === 'PUT') {
            if (!$id) response('error', 'ID requerido para actualizar');
            if (!$input) response('error', 'No se recibieron datos para actualizar');
            
            unset($input['id']); // No intentar actualizar la PK
            
            $fields = "";
            foreach ($input as $key => $val) { $fields .= "`$key` = ?,"; }
            $fields = rtrim($fields, ',');
            
            $stmt = $pdo->prepare("UPDATE $table SET $fields WHERE id = ?");
            $params = array_values($input);
            $params[] = $id;
            
            $stmt->execute($params);
            success("Registro actualizado correctamente");
        } 
        elseif ($method === 'DELETE') {
            if (!$id) response('error', 'ID requerido para eliminar');
            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            success("Registro eliminado");
        }
    } catch (PDOException $e) {
        http_response_code(400); // Bad Request
        response('error', 'Error de Base de Datos: ' . $e->getMessage());
    }
}

function handlePlayers($pdo, $method, $id, $input) {
    try {
        if ($method === 'PATCH') {
            if (!$id || !isset($input['status'])) response('error', 'ID y Status requeridos');
            $stmt = $pdo->prepare("UPDATE players SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $id]);
            success("Estado actualizado");
        } else {
            handleCrud($pdo, 'players', $method, $id, $input);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        response('error', 'Error en Jugadores: ' . $e->getMessage());
    }
}

function handleSettings($pdo, $method, $input) {
    if ($method === 'GET') {
        $key = $_GET['key'] ?? '';
        $stmt = $pdo->prepare("SELECT value FROM settings WHERE `key` = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if ($row) {
            // Importante: El valor ya es un JSON string en la BD
            echo $row['value'];
        } else {
            echo json_encode(null);
        }
    } 
    elseif ($method === 'POST') {
        if (!isset($input['key']) || !isset($input['value'])) {
            response('error', 'Datos de configuración incompletos');
        }
        $key = $input['key'];
        // Si el valor es un array/objeto, lo convertimos a JSON string para la BD
        $value = is_array($input['value']) ? json_encode($input['value']) : $input['value'];
        
        $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
        $stmt->execute([$key, $value, $value]);
        success("Configuración guardada");
    }
}
