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

// Garantizar infraestructura financiera básica en cada petición
if (function_exists('syncBillingCalendar')) {
    syncBillingCalendar($pdo);
}

// Soporte para servidores que bloquean DELETE/PUT/PATCH
// Se puede enviar el método real en la URL o en el JSON como '_method'
$method = $_SERVER['REQUEST_METHOD'];
if (isset($_GET['_method'])) $method = strtoupper($_GET['_method']);
if (isset($input['_method'])) $method = strtoupper($input['_method']);

$id = $_GET['id'] ?? null;
if (!$id && isset($input['id'])) {
    $id = $input['id'];
}

function response($status, $payload = null) {
    $res = ['status' => $status];
    if ($status === 'error' && is_string($payload)) {
        $res['message'] = $payload;
    } else {
        $res['data'] = $payload;
    }
    // Debug log for errors
    if ($status === 'error') {
        error_log("API Error: " . json_encode($res));
    }
    echo json_encode($res);
    exit;
}

function success($msg = "Operación exitosa") {
    echo json_encode(['status' => 'success', 'message' => $msg]);
    exit;
}

switch ($action) {
    case 'news':
        // Auto-migration for news table
        try {
            $pdo->exec("ALTER TABLE news ADD COLUMN IF NOT EXISTS gallery LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE news ADD COLUMN IF NOT EXISTS show_social TINYINT DEFAULT 1");
        } catch (\Throwable $t) {
            // Fallback for servers with older MySQL
            try { $pdo->exec("ALTER TABLE news ADD gallery LONGTEXT"); } catch (\Throwable $t2) {}
            try { $pdo->exec("ALTER TABLE news ADD show_social TINYINT DEFAULT 1"); } catch (\Throwable $t3) {}
        }
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
        handleGallery($pdo, $method, $id, $input);
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
    case 'sync_finances':
        if ($method === 'POST') {
            recalculateAllPlayersStatus($pdo);
            success("Sincronización financiera completada");
        }
        break;
    default:
        response('error', 'Acción no válida: ' . $action);
}

function syncBillingCalendar($pdo) {
    // 1. Asegurar que las tablas existan (Migración automática)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS billing_calendar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            month INT NOT NULL,
            year INT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            description VARCHAR(255),
            UNIQUE KEY unique_month_year (month, year)
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS club_subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_id INT NOT NULL,
            month INT NOT NULL,
            year INT NOT NULL,
            amount DECIMAL(15,2) DEFAULT 20000.00,
            status ENUM('Pendiente', 'Pagado') DEFAULT 'Pendiente',
            payment_id INT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )");
    } catch (\Throwable $t) {
        // Silencioso o log error
    }

    // 2. Corregir pagos antiguos sin año (Migración de datos)
    try {
        $pdo->exec("UPDATE payments SET year = YEAR(fecha) WHERE year IS NULL OR year = 0");
    } catch (\Throwable $t) {}

    $month = (int)date('n');
    $year = (int)date('Y');
    
    // Asegurar que el mes actual existe en el calendario
    $stmt = $pdo->prepare("INSERT IGNORE INTO billing_calendar (month, year, is_active, description) VALUES (?, ?, 1, 'Generado automáticamente')");
    $stmt->execute([$month, $year]);
}

function isCompetitive($categoryName) {
    if (!$categoryName) return false;
    $n = strtolower($categoryName);
    if (strpos($n, 'escuela') !== false) return false;
    if (strpos($n, 'primera') !== false) return true;
    
    // Buscar "Sub-13" o similar
    if (preg_match('/sub[\s-]*(\d+)/', $n, $matches)) {
        if ((int)$matches[1] >= 13) return true;
    }
    return false;
}

function getPlayerDebtDetails($pdo, $playerId) {
    // 1. Obtener datos del jugador
    $stmt = $pdo->prepare("SELECT * FROM players WHERE id = ?");
    $stmt->execute([$playerId]);
    $player = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$player) return null;

    $category = $player['category'];
    $isComp = isCompetitive($category);
    $sponsorship = $player['sponsorship'] ?? 'none';
    $customFee = $player['custom_fee'] ?? null;
    $regDate = $player['registrationDate'] ?? date('Y-m-d');
    
    // Extraer año y mes de registro
    $regTimestamp = strtotime($regDate);
    $regYear = (int)date('Y', $regTimestamp);
    $regMonth = (int)date('n', $regTimestamp);

    $currentYear = (int)date('Y');
    $currentMonth = (int)date('n');

    $details = [
        'monthly_debt' => 0,
        'subscription_debt' => 0,
        'inscription_debt' => 0,
        'has_debt' => false,
        'total_debt' => 0
    ];

    if ($sponsorship === 'full') return $details;

    // 2. Obtener meses activos
    $stmtMonths = $pdo->prepare("
        SELECT month, year FROM billing_calendar 
        WHERE is_active = 1 
        AND (year > ? OR (year = ? AND month >= ?))
        AND (year < ? OR (year = ? AND month <= ?))
        ORDER BY year ASC, month ASC
    ");
    $stmtMonths->execute([$regYear, $regYear, $regMonth, $currentYear, $currentYear, $currentMonth]);
    $activeMonths = $stmtMonths->fetchAll(PDO::FETCH_ASSOC);

    if ($isComp) {
        // COMPETITIVOS: Suscripción Club
        $fee = (float)($customFee ?? 20000);
        if ($sponsorship === 'partial') $fee = $fee / 2;

        foreach ($activeMonths as $mRecord) {
            $m = $mRecord['month'];
            $y = $mRecord['year'];
            
            // Prioridad a club_subscriptions, luego a payments
            $stmtDebt = $pdo->prepare("SELECT COUNT(*) FROM club_subscriptions WHERE player_id = ? AND month = ? AND year = ? AND status = 'Pagado'");
            $stmtDebt->execute([$playerId, $m, $y]);
            if ($stmtDebt->fetchColumn() == 0) {
                $stmtP = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE jugadorId = ? AND mes = ? AND tipo = 'Suscripción Club' AND year = ?");
                $stmtP->execute([$playerId, $m, $y]);
                if ($stmtP->fetchColumn() == 0) {
                    $details['subscription_debt'] += $fee;
                    $details['has_debt'] = true;
                }
            }
        }
    } else {
        // ESCUELA: Inscripción (anual) + Mensualidad
        $monthlyFee = (float)($customFee ?? 50000);
        if ($sponsorship === 'partial') $monthlyFee = $monthlyFee / 2;

        if ($sponsorship === 'none') {
            // Inscripción anual (asumimos $50k si no se especifica, pero aquí solo checkeamos existencia para el estado)
            $stmtIns = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE jugadorId = ? AND tipo = 'Inscripción' AND year = ?");
            $stmtIns->execute([$playerId, $currentYear]);
            if ($stmtIns->fetchColumn() == 0) {
                $details['inscription_debt'] = 50000; // Valor de referencia
                $details['has_debt'] = true;
            }
        }

        foreach ($activeMonths as $mRecord) {
            $m = $mRecord['month'];
            $y = $mRecord['year'];
            
            $stmtP = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE jugadorId = ? AND mes = ? AND tipo = 'Mensualidad' AND year = ?");
            $stmtP->execute([$playerId, $m, $y]);
            if ($stmtP->fetchColumn() == 0) {
                $details['monthly_debt'] += $monthlyFee;
                $details['has_debt'] = true;
            }
        }
    }

    $details['total_debt'] = $details['monthly_debt'] + $details['subscription_debt'] + $details['inscription_debt'];
    return $details;
}

function recalculatePlayerStatus($pdo, $playerId) {
    $details = getPlayerDebtDetails($pdo, $playerId);
    if (!$details) return 'Pendiente';
    
    $newStatus = $details['has_debt'] ? 'Pendiente' : 'Al Día';
    $qty = $details['has_debt'] ? 1 : 0; // Podríamos ser más específicos con "En Mora" si tiene > 2 meses

    $upd = $pdo->prepare("UPDATE players SET paymentStatus = ? WHERE id = ?");
    $upd->execute([$newStatus, $playerId]);
    return $newStatus;
}

function recalculateAllPlayersStatus($pdo) {
    $stmt = $pdo->query("SELECT id FROM players WHERE status = 'Aceptado'");
    $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($players as $id) {
        recalculatePlayerStatus($pdo, $id);
    }
}

function handleContact($pdo, $input) {
    if (!$input) response('error', 'Datos de contacto no recibidos');
    $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $input['name'] ?? 'Anonimo', 
        $input['email'] ?? '', 
        $input['subject'] ?? 'Consulta Web', 
        $input['message'] ?? ''
    ]);
    success("Mensaje enviado correctamente");
}

function handleCrud($pdo, $table, $method, $id, $input) {
    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
            $stmt->execute([$id]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            response('success', $res ?: null);
        } else {
            $stmt = $pdo->query("SELECT * FROM `$table` ORDER BY id DESC");
            response('success', $stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($method === 'POST') {
        if (!$input) response('error', 'No hay datos para insertar');
        $keys = array_keys($input);
        // Filtrar campos que no pertenezcan al método (como _method)
        $keys = array_filter($keys, function($k) { return $k !== '_method' && $k !== 'id'; });
        
        $fields = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        
        $stmt = $pdo->prepare("INSERT INTO `$table` ($fields) VALUES ($placeholders)");
        $data = [];
        foreach($keys as $k) $data[] = $input[$k];
        
        $stmt->execute($data);
        success("Registro creado exitosamente");
    } elseif ($method === 'PUT' || $method === 'PATCH') {
        if (!$id) response('error', 'ID requerido para actualizar');
        if (!$input) response('error', 'No hay datos para actualizar');
        
        $fields = [];
        $values = [];
        foreach ($input as $key => $val) {
            if ($key !== 'id' && $key !== '_method') {
                $fields[] = "`$key` = ?";
                $values[] = $val;
            }
        }
        
        if (empty($fields)) response('error', 'No se enviaron campos válidos');
        
        $values[] = $id;
        $sql = "UPDATE `$table` SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        success("Registro actualizado exitosamente");
    } elseif ($method === 'DELETE') {
        if (!$id) response('error', 'ID requerido para eliminar');
        
        // CASCADA MANUAL: Si borramos un usuario (padre), borrar sus hijos y todo lo relacionado
        if ($table === 'users') {
            $stmtU = $pdo->prepare("SELECT email FROM users WHERE id = ?");
            $stmtU->execute([$id]);
            $uEmail = $stmtU->fetchColumn();
            
            if ($uEmail) {
                // Buscar todos los hijos vinculados a ese correo
                $stmtH = $pdo->prepare("SELECT id FROM players WHERE email = ?");
                $stmtH->execute([$uEmail]);
                $hijosIds = $stmtH->fetchAll(PDO::FETCH_COLUMN);
                
                foreach ($hijosIds as $hId) {
                    // Borrar historial de cada hijo (esto dispara la misma limpieza que borrar un jugador solo)
                    $pdo->prepare("DELETE FROM payments WHERE jugadorId = ?")->execute([$hId]);
                    $pdo->prepare("DELETE FROM club_subscriptions WHERE player_id = ?")->execute([$hId]);
                    $pdo->prepare("DELETE FROM peace_and_safety_requests WHERE player_id = ?")->execute([$hId]);
                }
                // Finalmente borrar los registros de los hijos
                $pdo->prepare("DELETE FROM players WHERE email = ?")->execute([$uEmail]);
            }
        }
        
        // Si borramos un jugador directamente (no vía borrar usuario)
        if ($table === 'players') {
            $pdo->prepare("DELETE FROM payments WHERE jugadorId = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM club_subscriptions WHERE player_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM peace_and_safety_requests WHERE player_id = ?")->execute([$id]);
        }
        
        // Si borramos una suscripción, recalcular estado del jugador
        $pId = null;
        if ($table === 'club_subscriptions' || $table === 'subscriptions') {
            $stmtP = $pdo->prepare("SELECT player_id FROM club_subscriptions WHERE id = ?");
            $stmtP->execute([$id]);
            $pId = $stmtP->fetchColumn();
        }

        $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);

        if ($pId) recalculatePlayerStatus($pdo, $pId);
        
        success("Registro eliminado exitosamente");
    }
}

function handlePayments($pdo, $method, $id, $input) {
    // Asegurar que la columna year existe en payments
    try {
        $pdo->exec("ALTER TABLE payments ADD COLUMN IF NOT EXISTS year INT DEFAULT NULL");
    } catch (\Throwable $t) {
        try { $pdo->exec("ALTER TABLE payments ADD year INT DEFAULT NULL"); } catch (\Throwable $t2) {}
    }

    if ($method === 'POST') {
        if (!isset($input['jugadorId'])) {
            if (isset($input['player_id'])) $input['jugadorId'] = $input['player_id'];
        }

        $paymentYear = $input['year'] ?? (int)date('Y');

        if (isset($input['tipo']) && $input['tipo'] === 'Suscripción Club') {
            $pdo->beginTransaction();
            try {
                $stmtP = $pdo->prepare("INSERT INTO payments (jugadorId, tipo, mes, year, valor, metodo, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmtP->execute([
                    $input['jugadorId'],
                    $input['tipo'],
                    $input['mes'] ?? date('n'),
                    $paymentYear,
                    $input['valor'] ?? 20000,
                    $input['metodo'] ?? 'Efectivo',
                    $input['fecha'] ?? date('Y-m-d')
                ]);
                $paymentId = $pdo->lastInsertId();

                $month = $input['mes'] ?? date('n');
                
                $stmtS = $pdo->prepare("UPDATE club_subscriptions SET status = 'Pagado', payment_id = ? WHERE player_id = ? AND month = ? AND year = ?");
                $stmtS->execute([$paymentId, $input['jugadorId'], $month, $paymentYear]);
                
                if ($stmtS->rowCount() === 0) {
                     $stmtInsS = $pdo->prepare("INSERT INTO club_subscriptions (player_id, month, year, amount, status, payment_id) VALUES (?, ?, ?, ?, 'Pagado', ?)");
                     $stmtInsS->execute([$input['jugadorId'], $month, $paymentYear, $input['valor'] ?? 20000, $paymentId]);
                }

                $pdo->commit();
                recalculatePlayerStatus($pdo, $input['jugadorId']);
                success("Pago de suscripción registrado correctamente");
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                response('error', 'Error al sincronizar pago: ' . $e->getMessage());
            }
        } else {
             try {
                $filteredData = [
                    'jugadorId' => $input['jugadorId'],
                    'tipo' => $input['tipo'],
                    'mes' => $input['mes'] ?? date('n'),
                    'year' => $paymentYear,
                    'valor' => $input['valor'],
                    'metodo' => $input['metodo'] ?? 'Efectivo',
                    'fecha' => $input['fecha'] ?? date('Y-m-d')
                ];
                $keys = array_keys($filteredData);
                $fields = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
                $placeholders = implode(',', array_fill(0, count($keys), '?'));
                
                $stmt = $pdo->prepare("INSERT INTO payments ($fields) VALUES ($placeholders)");
                $stmt->execute(array_values($filteredData));
                
                if (isset($input['jugadorId'])) {
                    recalculatePlayerStatus($pdo, $input['jugadorId']);
                }
                
                success("Pago registrado correctamente");
             } catch (Exception $e) {
                response('error', "Error al registrar pago: " . $e->getMessage());
             }
        }
    } elseif ($method === 'GET' && isset($_GET['jugadorId'])) {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE jugadorId = ? ORDER BY year DESC, mes DESC, fecha DESC");
        $stmt->execute([$_GET['jugadorId']]);
        response('success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'DELETE') {
        if (!$id) response('error', 'ID de pago requerido');
        
        $stmtP = $pdo->prepare("SELECT jugadorId FROM payments WHERE id = ?");
        $stmtP->execute([$id]);
        $pId = $stmtP->fetchColumn();
        
        if ($pId) {
            $stmt = $pdo->prepare("DELETE FROM payments WHERE id = ?");
            $stmt->execute([$id]);
            $stmtS = $pdo->prepare("UPDATE club_subscriptions SET status = 'Pendiente', payment_id = NULL WHERE payment_id = ?");
            $stmtS->execute([$id]);
            recalculatePlayerStatus($pdo, $pId);
            success("Pago eliminado y estado del jugador actualizado");
        } else {
            response('error', 'Pago no encontrado');
        }
    } elseif ($method === 'PATCH' || $method === 'PUT') {
        if (!$id) response('error', 'ID requerido');
        
        // 1. Obtener ID del jugador antes de actualizar
        $stmtP = $pdo->prepare("SELECT jugadorId FROM payments WHERE id = ?");
        $stmtP->execute([$id]);
        $pId = $stmtP->fetchColumn();

        // 2. Ejecutar actualización genérica
        handleCrud($pdo, 'payments', $method, $id, $input);

        // 3. Recalcular estado
        if ($pId) recalculatePlayerStatus($pdo, $pId);
        exit;
    } else {
        handleCrud($pdo, 'payments', $method, $id, $input);
    }
}


function handlePlayers($pdo, $method, $id, $input) {
    try {
        // Asegurar que la tabla existe (Auto-migración robusta)
        $pdo->exec("CREATE TABLE IF NOT EXISTS players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullName VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            status ENUM('Pendiente', 'Aceptado', 'Rechazado') DEFAULT 'Pendiente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        if ($method === 'GET') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM players WHERE id = ?");
                $stmt->execute([$id]);
                $res = $stmt->fetch(PDO::FETCH_ASSOC);
                response('success', $res ?: null);
            } else {
                $parentEmail = $_GET['parentEmail'] ?? null;
                if ($parentEmail) {
                    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
                    $token = '';
                    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) $token = $matches[1];

                    $validToken = false;
                    if ($token) {
                        $stmtUser = $pdo->prepare("SELECT email, role FROM users WHERE token = ?");
                        $stmtUser->execute([$token]);
                        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
                        if ($user) {
                            $validToken = true;
                            if ($user['role'] === 'padre_familia') $parentEmail = $user['email'];
                        }
                    }
                    if (!$validToken) { echo json_encode([]); exit; }

                    $stmt = $pdo->prepare("SELECT * FROM players WHERE email = ? ORDER BY id DESC");
                    $stmt->execute([$parentEmail]);
                } else {
                    $stmt = $pdo->query("SELECT * FROM players ORDER BY id DESC");
                }
                response('success', $stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            exit;
        }

        if ($method === 'PATCH' || $method === 'POST' || $method === 'PUT') {
            $columnsToEnsure = [
                "dni VARCHAR(50) DEFAULT NULL",
                "documentType VARCHAR(50) DEFAULT NULL",
                "sponsorship ENUM('none', 'partial', 'full') DEFAULT 'none'",
                "custom_fee DECIMAL(15,2) DEFAULT NULL",
                "paymentStatus VARCHAR(50) DEFAULT 'Pendiente'",
                "position VARCHAR(100) DEFAULT NULL",
                "notes TEXT DEFAULT NULL",
                "categoryId INT DEFAULT NULL",
                "photo VARCHAR(255) DEFAULT NULL",
                "dniImage VARCHAR(255) DEFAULT NULL",
                "medicalCertificate VARCHAR(255) DEFAULT NULL",
                "parentName VARCHAR(255) DEFAULT NULL",
                "phone VARCHAR(50) DEFAULT NULL",
                "address TEXT DEFAULT NULL",
                "birthDate DATE DEFAULT NULL",
                "registrationDate DATE DEFAULT NULL",
                "age INT DEFAULT NULL",
                "category VARCHAR(100) DEFAULT NULL"
            ];

            foreach ($columnsToEnsure as $colDef) {
                try {
                    $pdo->exec("ALTER TABLE players ADD COLUMN IF NOT EXISTS $colDef");
                } catch (\Throwable $t) {
                    try { $pdo->exec("ALTER TABLE players ADD $colDef"); } catch (\Throwable $t2) {}
                }
            }
        }

        if ($method === 'PATCH') {
            if (!$id) response('error', 'ID requerido');
            $fields = [];
            $params = [];
            $allowed = ['status', 'dni', 'paymentStatus', 'parentEmail', 'sponsorship', 'custom_fee', 'position', 'notes', 'fullName', 'category', 'birthDate', 'photo', 'categoryId'];
            foreach ($allowed as $key) {
                if (isset($input[$key])) {
                    $col = ($key === 'parentEmail') ? 'email' : $key;
                    $fields[] = "`$col` = ?";
                    $params[] = $input[$key];
                }
            }
            if (empty($fields)) response('error', 'No hay campos para actualizar');
            $sql = "UPDATE players SET " . implode(', ', $fields) . " WHERE id = ?";
            $params[] = $id;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            if (isset($input['sponsorship']) || isset($input['custom_fee']) || isset($input['category'])) {
                recalculatePlayerStatus($pdo, $id);
            }
            success("Jugador actualizado");
        } 
        elseif ($method === 'POST') {
            $data = [];
            $mapping = [
                'fullName' => 'fullName', 'name' => 'fullName', 'playerName' => 'fullName',
                'age' => 'age', 'category' => 'category', 'categoryName' => 'category',
                'birthDate' => 'birthDate', 'registrationDate' => 'registrationDate',
                'status' => 'status', 'paymentStatus' => 'paymentStatus',
                'photo' => 'photo', 'dniImage' => 'dniImage', 'documentType' => 'documentType',
                'medicalCertificate' => 'medicalCertificate', 'parentName' => 'parentName',
                'phone' => 'phone', 'email' => 'email', 'parentEmail' => 'email',
                'address' => 'address', 'dni' => 'dni', 'position' => 'position',
                'notes' => 'notes', 'categoryId' => 'categoryId',
                'sponsorship' => 'sponsorship', 'custom_fee' => 'custom_fee'
            ];

            foreach ($mapping as $frontendKey => $dbCol) {
                if (isset($input[$frontendKey]) && $input[$frontendKey] !== '') {
                    $data[$dbCol] = $input[$frontendKey];
                }
            }

            if (empty($data['fullName'])) {
                 $receivedKeys = is_array($input) ? implode(', ', array_keys($input)) : 'Body vacio o no es array';
                 response('error', 'El nombre del jugador es obligatorio. Recibido: ' . $receivedKeys);
            }

            // Valores por defecto
            if (!isset($data['status'])) $data['status'] = 'Pendiente';
            if (!isset($data['paymentStatus'])) $data['paymentStatus'] = 'Pendiente';

            $q = $pdo->query("DESCRIBE players");
            $existingCols = $q->fetchAll(PDO::FETCH_COLUMN);
            $filteredData = [];
            foreach($data as $col => $val) {
                if (in_array($col, $existingCols)) $filteredData[$col] = $val;
            }

            // INSERTAR JUGADOR MANUALMENTE PARA OBTENER ID
            $keys = array_keys($filteredData);
            $fieldsStr = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
            $placeholders = implode(',', array_fill(0, count($keys), '?'));
            
            $stmt = $pdo->prepare("INSERT INTO players ($fieldsStr) VALUES ($placeholders)");
            $stmt->execute(array_values($filteredData));
            $newPlayerId = $pdo->lastInsertId();

            // --- AUTO-REGISTRO DE PAGOS INICIALES ELIMINADO ---
            // Los pagos deben ser registrados manualmente por el administrador
            // o a través del portal de pagos oficial para evitar inconsistencias.
            
            // Recalcular estado para que aparezca como "Pendiente" si tiene deudas (Inscripción/Mensualidad)
            recalculatePlayerStatus($pdo, $newPlayerId);

            success("Registro creado exitosamente");
        } else {
            handleCrud($pdo, 'players', $method, $id, $input);
        }
    } catch (Throwable $e) {
        http_response_code(400);
        response('error', "Error en Jugadores: " . $e->getMessage() . " (L" . $e->getLine() . ")");
    }
}

function handleGallery($pdo, $method, $id, $input) {
    try {
        $pdo->exec("ALTER TABLE gallery ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT NULL");
        $pdo->exec("ALTER TABLE gallery ADD COLUMN IF NOT EXISTS type ENUM('photo', 'video') DEFAULT 'photo'");
        $pdo->exec("ALTER TABLE gallery ADD COLUMN IF NOT EXISTS videoUrl VARCHAR(255) DEFAULT NULL");
        $pdo->exec("ALTER TABLE gallery ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'fa-solid fa-image'");
    } catch (\Throwable $t) { /* silent fail */ }

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            response('success', $item ?: null);
        } else {
            $stmt = $pdo->query("SELECT * FROM gallery ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $normalized = array_map(function($item) {
                $item['image'] = $item['url'] ?? '';
                $item['title'] = $item['title'] ?? $item['caption'] ?? '';
                return $item;
            }, $data);
            response('success', $normalized);
        }
    } elseif ($method === 'POST') {
        $url = $input['url'] ?? $input['image'] ?? '';
        $title = $input['title'] ?? $input['caption'] ?? '';
        $type = $input['type'] ?? 'photo';
        $category = $input['category'] ?? 'Todas';
        $icon = $input['icon'] ?? 'fa-solid fa-image';
        $videoUrl = $input['videoUrl'] ?? '';
        
        // Comprobar si existe la columna title o caption
        $stmt = $pdo->prepare("INSERT INTO gallery (url, title, category, type, icon, videoUrl) VALUES (?, ?, ?, ?, ?, ?)");
        try {
            $stmt->execute([$url, $title, $category, $type, $icon, $videoUrl]);
        } catch (PDOException $e) {
            // Fallback para schema antiguo manual si MySQL falla por title
            $stmt = $pdo->prepare("INSERT INTO gallery (url, caption, category, type, icon, videoUrl) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$url, $title, $category, $type, $icon, $videoUrl]);
        }
        success("Media agregada a galería");
    } elseif ($method === 'PUT' || $method === 'PATCH') {
        if (!$id) response('error', 'ID requerido');
        $url = $input['url'] ?? $input['image'] ?? '';
        $title = $input['title'] ?? $input['caption'] ?? '';
        $type = $input['type'] ?? 'photo';
        $category = $input['category'] ?? 'Todas';
        $icon = $input['icon'] ?? 'fa-solid fa-image';
        $videoUrl = $input['videoUrl'] ?? '';
        
        try {
            $stmt = $pdo->prepare("UPDATE gallery SET url=?, title=?, category=?, type=?, icon=?, videoUrl=? WHERE id=?");
            $stmt->execute([$url, $title, $category, $type, $icon, $videoUrl, $id]);
        } catch (PDOException $e) {
            $stmt = $pdo->prepare("UPDATE gallery SET url=?, caption=?, category=?, type=?, icon=?, videoUrl=? WHERE id=?");
            $stmt->execute([$url, $title, $category, $type, $icon, $videoUrl, $id]);
        }
        success("Media actualizada");
    } elseif ($method === 'DELETE') {
        if (!$id) response('error', 'ID requerido');
        $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        success("Media eliminada");
    }
}

function handleSettings($pdo, $method, $input) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
            `key` VARCHAR(100) PRIMARY KEY,
            `value` LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
    } catch (\Throwable $t) { /* silent fail */ }

    if ($method === 'GET') {
        $key = $_GET['key'] ?? '';
        if (!$key) response('error', 'Key requerida');
        
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if ($row) {
            // Decodificamos el JSON guardado para enviarlo como DATA real en el wrapper standard
            $val = json_decode($row['value'], true);
            response('success', $val ?: $row['value']);
        } else {
            response('success', null);
        }
    } 
    elseif ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        if (!isset($input['key']) || !isset($input['value'])) {
            response('error', 'Datos de configuración incompletos');
        }
        $key = $input['key'];
        // Si el valor es un array/objeto, lo encodeamos como JSON string para MySQL
        $value = is_array($input['value']) ? json_encode($input['value']) : $input['value'];
        
        try {
            $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
            $stmt->execute([$key, $value, $value]);
            success("Configuración '$key' guardada correctamente");
        } catch (Exception $e) {
            response('error', "Error al guardar configuración: " . $e->getMessage());
        }
    }
}

function handleAuth($pdo, $method, $input) {
    if ($method !== 'POST') response('error', 'Método no permitido');

    // Make sure token column exists
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS token VARCHAR(255) DEFAULT NULL");
    } catch (\Throwable $t) { /* silent fail */ }
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $google_id = $input['google_id'] ?? null;

    if ($google_id) {
        // Login con Google
        $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ? OR email = ?");
        $stmt->execute([$google_id, $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Usuario existe, actualizar google_id si es necesario y generar token
            $token = bin2hex(random_bytes(32));
            $upd = $pdo->prepare("UPDATE users SET google_id = ?, token = ? WHERE id = ?");
            $upd->execute([$google_id, $token, $user['id']]);
            
            unset($user['password']);
            $user['token'] = $token;
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            // Usuario nuevo de Google (Registro automático)
            $generatedUsername = explode('@', $email)[0] . '_' . rand(100, 999);
            $token = bin2hex(random_bytes(32));
            $stmt = $pdo->prepare("INSERT INTO users (name, email, google_id, role, photo, username, token) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['name'] ?? 'Usuario de Google',
                $email,
                $google_id,
                'padre_familia',
                $input['photo'] ?? null,
                $generatedUsername,
                $token
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
        $token = bin2hex(random_bytes(32));
        $upd = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
        $upd->execute([$token, $user['id']]);
        $user['token'] = $token;
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
            response('success', $stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } 
    elseif ($method === 'POST') {
        // Nueva solicitud o cálculo previo
        $playerId = $input['player_id'] ?? null;
        if (!$playerId) response('error', 'ID de jugador requerido');
        
        // 1. Obtener deudas reales del motor centralizado
        $debt = getPlayerDebtDetails($pdo, $playerId);
        if (!$debt) response('error', 'Jugador no encontrado');
        
        $monthlyDebt = $debt['monthly_debt'];
        $inscriptionDebt = $debt['inscription_debt'];
        $subscriptionDebt = $debt['subscription_debt'];
        
        // 2. Convenio / Beca (Valor Informativo)
        $stmtC = $pdo->prepare("SELECT discount_amount FROM player_conventions WHERE player_id = ? AND active = 1 ORDER BY id DESC LIMIT 1");
        $stmtC->execute([$playerId]);
        $convention = $stmtC->fetch(PDO::FETCH_ASSOC);
        $discount = $convention ? (float)$convention['discount_amount'] : 0;
        
        // 3. Valor base derecho Paz y Salvo
        $stmtP = $pdo->prepare("SELECT category FROM players WHERE id = ?");
        $stmtP->execute([$playerId]);
        $cat = $stmtP->fetchColumn();
        $isEscuela = (strpos(strtolower($cat), 'escuela') !== false);
        $baseValue = $isEscuela ? 0 : 200000;
        
        $totalToPay = $monthlyDebt + $inscriptionDebt + $subscriptionDebt + ($baseValue - $discount);
        if ($totalToPay < 0) $totalToPay = 0;

        // Si es solo para CÁLCULO (sin guardar)
        if (isset($input['only_calculate']) && $input['only_calculate']) {
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'monthly_debt' => $monthlyDebt,
                    'inscription_debt' => $inscriptionDebt,
                    'subscription_debt' => $subscriptionDebt,
                    'base_value' => $baseValue,
                    'convention_discount' => $discount,
                    'total_to_pay' => $totalToPay,
                    'is_escuela' => $isEscuela
                ]
            ]);
            exit;
        }

        // GUARDAR SOLICITUD
        $stmtIns = $pdo->prepare("INSERT INTO peace_and_safety_requests 
            (player_id, monthly_debt, subscription_debt, base_value, convention_discount, total_to_pay, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $status = ($isEscuela && $totalToPay <= 0) ? 'Generado' : 'Pendiente';
        
        $stmtIns->execute([
            $playerId, 
            $monthlyDebt + $inscriptionDebt, // Guardamos la suma en monthly_debt por compatibilidad de esquema
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
