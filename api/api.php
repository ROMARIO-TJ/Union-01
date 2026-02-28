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
        handlePayments($pdo, $method, $id, $input);
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
    case 'users':
        handleCrud($pdo, 'users', $method, $id, $input);
        break;
    case 'auth':
        handleAuth($pdo, $method, $input);
        break;
    case 'subscriptions':
        handleCrud($pdo, 'club_subscriptions', $method, $id, $input);
        break;
    case 'billing_calendar':
        handleCrud($pdo, 'billing_calendar', $method, $id, $input);
        break;
    case 'conventions':
        handleCrud($pdo, 'player_conventions', $method, $id, $input);
        break;
    case 'paz_salvo':
        handlePazSalvo($pdo, $method, $id, $input);
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
            
            // Obtener columnas reales para filtrar
            $stmtCols = $pdo->query("DESCRIBE $table");
            $validColumns = $stmtCols->fetchAll(PDO::FETCH_COLUMN);
            
            unset($input['id']);
            
            $filteredData = [];
            foreach ($input as $key => $value) {
                if (in_array($key, $validColumns)) {
                    $filteredData[$key] = $value;
                }
            }
            
            if (empty($filteredData)) response('error', 'No hay datos válidos para actualizar');
            
            $fields = "";
            $params = [];
            foreach ($filteredData as $key => $val) { 
                $fields .= "`$key` = ?,"; 
                $params[] = $val;
            }
            $fields = rtrim($fields, ',');
            
            $stmt = $pdo->prepare("UPDATE $table SET $fields WHERE id = ?");
            $params[] = $id;
            
            $stmt->execute($params);
            success("Registro actualizado correctamente");
        } 
        elseif ($method === 'DELETE') {
            if (!$id) response('error', 'ID requerido para eliminar');
            
            // ELIMINACIÓN EN CASCADA (Padre -> Jugador)
            // Si el motor de BD no tiene el trigger, lo forzamos por código
            if ($table === 'users') {
                $stmtEmail = $pdo->prepare("SELECT email FROM users WHERE id = ?");
                $stmtEmail->execute([$id]);
                $userRecord = $stmtEmail->fetch(PDO::FETCH_ASSOC);
                
                if ($userRecord && !empty($userRecord['email'])) {
                    // Borramos los jugadores asociados a este correo 
                    // (Los pagos se borrarán solos gracias a la regla de la BDD de pagos)
                    $stmtPlayers = $pdo->prepare("DELETE FROM players WHERE email = ?");
                    $stmtPlayers->execute([$userRecord['email']]);
                }
            }

            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            success("Registro eliminado");
        }
    } catch (PDOException $e) {
        http_response_code(400); // Bad Request
        response('error', 'Error de Base de Datos: ' . $e->getMessage());
    }
}

function handlePayments($pdo, $method, $id, $input) {
    if ($method === 'POST') {
        if (!isset($input['jugadorId'])) {
            // Intentar mapear si viene de un CRUD genérico antiguo
            if (isset($input['player_id'])) $input['jugadorId'] = $input['player_id'];
        }

        // Lógica especial para sincronizar con club_subscriptions
        if (isset($input['tipo']) && $input['tipo'] === 'Suscripción Club') {
            $pdo->beginTransaction();
            try {
                // 1. Insertar en payments (usando el motor de handleCrud minimizado)
                $stmtP = $pdo->prepare("INSERT INTO payments (jugadorId, tipo, mes, valor, metodo, fecha) VALUES (?, ?, ?, ?, ?, ?)");
                $stmtP->execute([
                    $input['jugadorId'],
                    $input['tipo'],
                    $input['mes'] ?? date('n'),
                    $input['valor'] ?? 20000,
                    $input['metodo'] ?? 'Efectivo',
                    $input['fecha'] ?? date('Y-m-d')
                ]);
                $paymentId = $pdo->lastInsertId();

                // 2. Actualizar o Insertar en club_subscriptions
                $year = date('Y');
                $month = $input['mes'] ?? date('n');
                
                $stmtS = $pdo->prepare("UPDATE club_subscriptions SET status = 'Pagado', payment_id = ? WHERE player_id = ? AND month = ? AND year = ?");
                $stmtS->execute([$paymentId, $input['jugadorId'], $month, $year]);
                
                if ($stmtS->rowCount() === 0) {
                     $stmtInsS = $pdo->prepare("INSERT INTO club_subscriptions (player_id, month, year, amount, status, payment_id) VALUES (?, ?, ?, ?, 'Pagado', ?)");
                     $stmtInsS->execute([$input['jugadorId'], $month, $year, $input['valor'] ?? 20000, $paymentId]);
                }

                $pdo->commit();
                success("Pago de suscripción registrado y sincronizado correctamente");
            } catch (Exception $e) {
                $pdo->rollBack();
                response('error', 'Error al sincronizar pago de suscripción: ' . $e->getMessage());
            }
        } else {
             handleCrud($pdo, 'payments', $method, $id, $input);
        }
    } else {
        handleCrud($pdo, 'payments', $method, $id, $input);
    }
}

function handlePlayers($pdo, $method, $id, $input) {
    try {
        if ($method === 'PATCH' || $method === 'POST' || $method === 'PUT') {
            // Asegurar que las columnas de identificación existen (Migración automática silenciosa)
            try {
                $pdo->exec("ALTER TABLE players ADD COLUMN IF NOT EXISTS dni VARCHAR(50) DEFAULT NULL");
                $pdo->exec("ALTER TABLE players ADD COLUMN IF NOT EXISTS documentType VARCHAR(50) DEFAULT NULL");
            } catch (\Throwable $t) { 
                // Silencioso, probablemente el servidor no soporta IF NOT EXISTS o ya existen
                try {
                    $pdo->exec("ALTER TABLE players ADD dni VARCHAR(50) DEFAULT NULL");
                    $pdo->exec("ALTER TABLE players ADD documentType VARCHAR(50) DEFAULT NULL");
                } catch (\Throwable $t2) {}
            }
        }

        if ($method === 'PATCH') {
            if (!$id) response('error', 'ID requerido');
            
            if (isset($input['status'])) {
                $stmt = $pdo->prepare("UPDATE players SET status = ? WHERE id = ?");
                $stmt->execute([$input['status'], $id]);
                success("Estado de registro actualizado");
            } 
            elseif (isset($input['dni'])) {
                $stmt = $pdo->prepare("UPDATE players SET dni = ? WHERE id = ?");
                $stmt->execute([$input['dni'], $id]);
                success("Documento de identidad actualizado");
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

function handleAuth($pdo, $method, $input) {
    if ($method !== 'POST') response('error', 'Método no permitido');
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $google_id = $input['google_id'] ?? null;

    if ($google_id) {
        // Login con Google
        $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ? OR email = ?");
        $stmt->execute([$google_id, $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Usuario existe, actualizar google_id si es necesario
            if (!$user['google_id']) {
                $upd = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $upd->execute([$google_id, $user['id']]);
            }
            unset($user['password']);
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            // Usuario nuevo de Google (Registro automático)
            $generatedUsername = explode('@', $email)[0] . '_' . rand(100, 999);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, google_id, role, photo, username) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['name'] ?? 'Usuario de Google',
                $email,
                $google_id,
                'padre_familia',
                $input['photo'] ?? null,
                $generatedUsername
            ]);
            $newId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$newId]);
            $newUser = $stmt->fetch(PDO::FETCH_ASSOC);
            unset($newUser['password']);
            echo json_encode(['status' => 'success', 'user' => $newUser, 'message' => 'Registro con Google exitoso']);
        }
        exit;
    }

    // Login por credenciales (Busca por email O por username)
    $stmt = $pdo->prepare("SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?");
    $stmt->execute([$email, $email, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        unset($user['password']);
        echo json_encode(['status' => 'success', 'user' => $user]);
    } else {
        response('error', 'Credenciales incorrectas');
    }
}

function handlePazSalvo($pdo, $method, $id, $input) {
    if ($method === 'GET') {
        if ($id) {
            // Obtener una solicitud específica
            $stmt = $pdo->prepare("SELECT r.*, p.fullName, p.category, p.email 
                                 FROM peace_and_safety_requests r 
                                 JOIN players p ON r.player_id = p.id 
                                 WHERE r.id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            // Listado de solicitudes con filtros
            $status = $_GET['status'] ?? null;
            $playerId = $_GET['player_id'] ?? null;
            
            $sql = "SELECT r.*, p.fullName, p.category, p.dni FROM peace_and_safety_requests r JOIN players p ON r.player_id = p.id";
            $where = [];
            $params = [];
            
            if ($status) { $where[] = "r.status = ?"; $params[] = $status; }
            if ($playerId) { $where[] = "r.player_id = ?"; $params[] = $playerId; }
            
            if (!empty($where)) $sql .= " WHERE " . implode(" AND ", $where);
            $sql .= " ORDER BY r.request_date DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } 
    elseif ($method === 'POST') {
        // Nueva solicitud o cálculo previo
        $playerId = $input['player_id'] ?? null;
        if (!$playerId) response('error', 'ID de jugador requerido');
        
        // 1. Obtener datos del jugador y su categoría
        $stmtP = $pdo->prepare("SELECT * FROM players WHERE id = ?");
        $stmtP->execute([$playerId]);
        $player = $stmtP->fetch(PDO::FETCH_ASSOC);
        if (!$player) response('error', 'Jugador no encontrado');
        
        // 2. Calcular Deudas
        // a) Mensualidades pendientes (Lógica simplificada por ahora: buscar pagos tipo 'Mensualidad' faltantes)
        // En una implementación real, esto compararía con meses activos en billing_calendar
        $stmtM = $pdo->prepare("SELECT SUM(valor) as pagado FROM payments WHERE jugadorId = ? AND tipo = 'Mensualidad'");
        $stmtM->execute([$playerId]);
        // Nota: Esta lógica requiere saber cuántos meses debería haber pagado.
        // Por simplicidad para el MVP, asumiremos que se envía la deuda calculada o se basa en un cálculo de meses activos.
        $monthlyDebt = $input['monthly_debt'] ?? 0; 
        
        // b) Suscripción Club ($20.000 x meses pendientes) - SOLO PARA COMPETITIVOS
        $isEscuela = (strpos(strtolower($player['category']), 'escuela') !== false);
        
        $subscriptionDebt = 0;
        if (!$isEscuela) {
            $stmtS = $pdo->prepare("SELECT COUNT(*) as pendientes FROM club_subscriptions WHERE player_id = ? AND status = 'Pendiente'");
            $stmtS->execute([$playerId]);
            $subsPendientes = $stmtS->fetch(PDO::FETCH_ASSOC)['pendientes'];
            $subscriptionDebt = $subsPendientes * 20000;
        }
        
        // c) Convenio
        $stmtC = $pdo->prepare("SELECT discount_amount FROM player_conventions WHERE player_id = ? AND active = 1 ORDER BY id DESC LIMIT 1");
        $stmtC->execute([$playerId]);
        $convention = $stmtC->fetch(PDO::FETCH_ASSOC);
        $discount = $convention ? $convention['discount_amount'] : 0;
        
        // Valor base: 200k para competitivos, 0 para Escuela
        $baseValue = $isEscuela ? 0 : 200000;
        
        $totalToPay = $monthlyDebt + $subscriptionDebt + ($baseValue - $discount);
        if ($totalToPay < 0) $totalToPay = 0;

        // Si es solo para CÁLCULO (sin guardar)
        if (isset($input['only_calculate']) && $input['only_calculate']) {
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'monthly_debt' => $monthlyDebt,
                    'subscription_debt' => $subscriptionDebt,
                    'base_value' => $baseValue,
                    'convention_discount' => $discount,
                    'total_to_pay' => $totalToPay,
                    'is_escuela' => (strpos(strtolower($player['category']), 'escuela') !== false)
                ]
            ]);
            exit;
        }

        // GUARDAR SOLICITUD
        $stmtIns = $pdo->prepare("INSERT INTO peace_and_safety_requests 
            (player_id, monthly_debt, subscription_debt, base_value, convention_discount, total_to_pay, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $status = (strpos(strtolower($player['category']), 'escuela') !== false && $totalToPay <= 0) ? 'Generado' : 'Pendiente';
        
        $stmtIns->execute([
            $playerId, 
            $monthlyDebt, 
            $subscriptionDebt, 
            $baseValue, 
            $discount, 
            $totalToPay,
            $status
        ]);
        
        success($status === 'Generado' ? "Paz y Salvo generado automáticamente" : "Solicitud enviada correctamente");
    }
    elseif ($method === 'PUT' || $method === 'PATCH') {
        // Actualizar estado (Aprobar/Rechazar)
        if (!$id) response('error', 'ID requerido');
        
        $fields = [];
        $params = [];
        foreach (['status', 'rejection_reason', 'approved_by', 'pdf_path'] as $f) {
            if (isset($input[$f])) {
                $fields[] = "$f = ?";
                $params[] = $input[$f];
            }
        }
        
        if (empty($fields)) response('error', 'Nada que actualizar');
        
        $params[] = $id;
        $stmtUpd = $pdo->prepare("UPDATE peace_and_safety_requests SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmtUpd->execute($params);
        success("Solicitud actualizada");
    }
}
