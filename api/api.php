<?php
header('Content-Type: application/json');
// Forzar error reporting (TEMPORAL PARA DEBUG)
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    case 'payments':
        handleCrud($pdo, 'payments', $method, $id, $input);
        break;
    case 'expenses':
        handleCrud($pdo, 'expenses', $method, $id, $input);
        break;
    case 'gallery':
        handleCrud($pdo, 'gallery', $method, $id, $input);
        break;
    case 'settings':
        handleSettings($pdo, $method, $input);
        break;
    case 'contact':
        handleContact($pdo, $input);
        break;
    default:
        response('error', 'Acción no válida: ' . $action);
}

function handleContact($pdo, $input) {
    if (empty($input['name']) || empty($input['email']) || empty($input['message'])) {
        response('error', 'Faltan campos obligatorios');
    }

    $to = "union_user@unionjaguera.com";
    $subject = "Nuevo mensaje de contacto: " . ($input['subject'] ?? 'Página Web');
    
    // HTML Message
    $message = "
    <html>
    <head><style>body{font-family:sans-serif;line-height:1.6;color:#333;}.header{background:#1fa774;color:white;padding:20px; text-align:center;}.content{padding:20px; background:#f9f9f9; border:1px solid #eee;}</style></head>
    <body>
        <div class='header'><h2>Nuevo Mensaje - Unión Jaguera</h2></div>
        <div class='content'>
            <p><strong>De:</strong> " . htmlspecialchars($input['name']) . " (" . htmlspecialchars($input['email']) . ")</p>
            <p><strong>Teléfono:</strong> " . htmlspecialchars($input['phone'] ?? 'N/A') . "</p>
            <p><strong>Asunto:</strong> " . htmlspecialchars($input['subject'] ?? 'N/A') . "</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p>" . nl2br(htmlspecialchars($input['message'])) . "</p>
        </div>
    </body>
    </html>";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Union Jaguera Site <union_user@unionjaguera.com>" . "\r\n";
    $headers .= "Reply-To: " . $input['email'] . "\r\n";

    $mailSent = @mail($to, $subject, $message, $headers);

    // Save to Database too
    try {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $input['name'],
            $input['email'],
            $input['phone'] ?? '',
            $input['subject'] ?? '',
            $input['message']
        ]);
    } catch (Exception $e) {
        // Log error but don't stop if mail was sent
    }

    if ($mailSent) {
        success('Mensaje enviado correctamente');
    } else {
        response('error', 'No se pudo enviar el correo, pero el mensaje fue guardado en la base de datos.');
    }
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
                // Soporte para filtros dinámicos (ej: ?action=players&parentEmail=...)
                $filters = $_GET;
                unset($filters['action'], $filters['id'], $filters['_method']);
                
                if (empty($filters)) {
                    $stmt = $pdo->query("SELECT * FROM $table ORDER BY id DESC");
                    echo json_encode($stmt->fetchAll());
                } else {
                    // Obtener columnas reales para filtrar
                    $stmtCols = $pdo->query("DESCRIBE $table");
                    $validColumns = $stmtCols->fetchAll(PDO::FETCH_COLUMN);

                    $where = [];
                    $values = [];
                    foreach ($filters as $key => $val) {
                        $columnToUse = $key;
                        // Mapeo inteligente para el portal de padres
                        if ($key === 'parentEmail' && !in_array('parentEmail', $validColumns) && in_array('email', $validColumns)) {
                            $columnToUse = 'email';
                        }
                        
                        if (in_array($columnToUse, $validColumns)) {
                            $where[] = "`$columnToUse` = ?";
                            $values[] = $val;
                        }
                    }
                    
                    if (empty($where)) {
                        $stmt = $pdo->query("SELECT * FROM $table ORDER BY id DESC");
                    } else {
                        $sql = "SELECT * FROM $table WHERE " . implode(' AND ', $where) . " ORDER BY id DESC";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute($values);
                    }
                    echo json_encode($stmt->fetchAll());
                }
            }
        } 
        elseif ($method === 'POST') {
            if (!$input) response('error', 'No se recibieron datos (JSON inválido)');
            
            // FILTRADO DINÁMICO: Obtener columnas reales de la tabla
            $stmtCols = $pdo->query("DESCRIBE $table");
            $validColumns = $stmtCols->fetchAll(PDO::FETCH_COLUMN);
            
            // Limpiar campos que no deben ir en el INSERT
            unset($input['id']);
            
            $filteredData = [];
            foreach ($input as $key => $value) {
                $columnToUse = $key;
                // Mapeo inteligente para el portal de padres al guardar
                if ($key === 'parentEmail' && !in_array('parentEmail', $validColumns) && in_array('email', $validColumns)) {
                    $columnToUse = 'email';
                }

                if (in_array($columnToUse, $validColumns)) {
                    $filteredData[$columnToUse] = $value;
                }
            }
            
            if (empty($filteredData)) response('error', 'No hay datos válidos para insertar');

            $keys = array_keys($filteredData);
            $fields = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
            $placeholders = implode(',', array_fill(0, count($keys), '?'));
            
            $stmt = $pdo->prepare("INSERT INTO $table ($fields) VALUES ($placeholders)");
            $stmt->execute(array_values($filteredData));
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
            if (!$id) response('error', 'ID requerido');
            
            if (isset($input['status'])) {
                $stmt = $pdo->prepare("UPDATE players SET status = ? WHERE id = ?");
                $stmt->execute([$input['status'], $id]);
                success("Estado de registro actualizado");
            } 
            elseif (isset($input['paymentStatus'])) {
                // Asegurar que la columna existe (Migración automática silenciosa)
                try {
                    $pdo->exec("ALTER TABLE players ADD paymentStatus VARCHAR(50) DEFAULT 'Pendiente'");
                } catch (\Throwable $t) { 
                    // Silencioso, probablemente ya existe
                }

                $stmt = $pdo->prepare("UPDATE players SET paymentStatus = ? WHERE id = ?");
                $stmt->execute([$input['paymentStatus'], $id]);
                
                if ($stmt->rowCount() > 0) {
                    success("Estado de pago actualizado correctamente");
                } else {
                    response('error', "No se encontró el jugador con ID: $id o el estado es el mismo.");
                }
            }
            elseif (isset($input['parentEmail'])) {
                $stmt = $pdo->prepare("UPDATE players SET email = ? WHERE id = ?");
                $stmt->execute([$input['parentEmail'], $id]);
                success("Correo del acudiente actualizado correctamente");
            }
            else {
                response('error', 'No se proporcionó ningún campo para actualizar');
            }
        } 
        else {
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
        $stmt = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if ($row) {
            echo $row['setting_value'];
        } else {
            echo json_encode(null);
        }
    } 
    elseif ($method === 'POST') {
        if (!isset($input['key']) || !isset($input['value'])) {
            response('error', 'Datos de configuración incompletos');
        }
        $key = $input['key'];
        $value = is_array($input['value']) ? json_encode($input['value']) : $input['value'];
        
        $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$key, $value, $value]);
        success("Configuración guardada");
    }
}
