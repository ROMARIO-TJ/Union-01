<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper para leer JSON del body
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

$conn = getConn();

switch ($action) {
    case 'news':
        handleNews($method, $conn);
        break;
    case 'players':
        handlePlayers($method, $conn);
        break;
    case 'matches':
        handleMatches($method, $conn);
        break;
    case 'payments':
        handlePayments($method, $conn);
        break;
    case 'expenses':
        handleExpenses($method, $conn);
        break;
    case 'categories':
        handleCategories($method, $conn);
        break;
    case 'settings':
        handleSettings($method, $conn);
        break;
    case 'contact-messages':
        handleContactMessages($method, $conn);
        break;
    case 'benefits':
        handleBenefits($method, $conn);
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Action not found"]);
        break;
}

// --- HANDLERS ---

function handleSettings($method, $conn) {
    if ($method === 'GET') {
        $key = $_GET['key'] ?? '';
        if ($key) {
            $stmt = $conn->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
            $stmt->execute([$key]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo $row ? $row['setting_value'] : '{}';
        } else {
             echo json_encode(["status" => "error", "message" => "Key required"]);
        }
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $key = $data['key'];
        $value = json_encode($data['value']);
        $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$key, $value, $value]);
        echo json_encode(["status" => "success"]);
    }
}

function handleNews($method, $conn) {
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM news WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $conn->prepare("SELECT * FROM news ORDER BY id DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO news (title, excerpt, date_str, image, content) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['title'], $data['excerpt'], $data['date'], $data['image'], $data['content']]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE news SET title=?, excerpt=?, date_str=?, image=?, content=? WHERE id=?");
        $stmt->execute([$data['title'], $data['excerpt'], $data['date'], $data['image'], $data['content'], $_GET['id']]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM news WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handlePlayers($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM players ORDER BY registrationDate DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO players (fullName, birthDate, age, category, parentName, phone, email, address, photo, dniImage, documentType, medicalCertificate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['fullName'], $data['birthDate'], $data['age'], $data['category'], 
            $data['parentName'], $data['phone'], $data['email'], $data['address'], 
            $data['photo'], $data['dniImage'], $data['documentType'], $data['medicalCertificate']
        ]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PATCH') { // Para actualizar el status
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE players SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $_GET['id']]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM players WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handlePayments($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM payments ORDER BY fecha DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO payments (jugadorId, tipo, mes, valor, fecha, metodo) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['jugadorId'], $data['tipo'], $data['mes'], $data['valor'], $data['fecha'], $data['metodo']
        ]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM payments WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handleExpenses($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM expenses ORDER BY fecha DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO expenses (concepto, valor, fecha) VALUES (?, ?, ?)");
        $stmt->execute([$data['concepto'], $data['valor'], $data['fecha']]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM expenses WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handleMatches($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM matches ORDER BY id DESC");
        $stmt->execute();
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $normalized = array_map(function($m) {
            $m['date'] = $m['date_str'];
            $m['time'] = $m['time_str'];
            return $m;
        }, $matches);
        echo json_encode($normalized);
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO matches (category, homeTeam, awayTeam, date_str, time_str, stadium, homeScore, awayScore, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['category'], $data['homeTeam'], $data['awayTeam'], 
            $data['date'], $data['time'], $data['stadium'],
            $data['homeScore'] ?? null, $data['awayScore'] ?? null, $data['status'] ?? 'scheduled'
        ]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE matches SET category=?, homeTeam=?, awayTeam=?, date_str=?, time_str=?, stadium=?, homeScore=?, awayScore=?, status=? WHERE id=?");
        $stmt->execute([
            $data['category'], $data['homeTeam'], $data['awayTeam'], 
            $data['date'], $data['time'], $data['stadium'],
            $data['homeScore'] ?? null, $data['awayScore'] ?? null, $data['status'] ?? 'scheduled',
            $_GET['id']
        ]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM matches WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handleCategories($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM categories ORDER BY id ASC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $fields = ['name', 'age', 'icon', 'schedule', 'time', 'coach', 'teamImage'];
        $values = [
            $data['name'], $data['age'], $data['icon'], 
            $data['schedule'] ?? '', $data['time'] ?? '', 
            $data['coach'] ?? '', $data['teamImage'] ?? ''
        ];
        $stmt = $conn->prepare("INSERT INTO categories (name, age, icon, schedule, time, coach, teamImage) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute($values);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE categories SET name=?, age=?, icon=?, schedule=?, time=?, coach=?, teamImage=? WHERE id=?");
        $stmt->execute([
            $data['name'], $data['age'], $data['icon'], 
            $data['schedule'] ?? '', $data['time'] ?? '', 
            $data['coach'] ?? '', $data['teamImage'] ?? '', 
            $_GET['id']
        ]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handleSponsors($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM sponsors ORDER BY id ASC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO sponsors (name, logo, url) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['logo'] ?? '', $data['url'] ?? '']);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE sponsors SET name=?, logo=?, url=? WHERE id=?");
        $stmt->execute([$data['name'], $data['logo'] ?? '', $data['url'] ?? '', $_GET['id']]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM sponsors WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}

function handleGallery($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM gallery ORDER BY id DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO gallery (url, caption, category) VALUES (?, ?, ?)");
        $stmt->execute([$data['url'], $data['caption'] ?? '', $data['category'] ?? 'Todas']);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
    }
}

function handleContactMessages($method, $conn) {
    if ($method === 'GET') {
        // Get all messages, ordered by newest first
        $stmt = $conn->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'PATCH') {
        // Update read status
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE contact_messages SET read_status = ? WHERE id = ?");
        $stmt->execute([$data['read_status'], $data['id']]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        // Delete message
        $id = getJsonInput()['id'] ?? $_GET['id'] ?? null;
        $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
    }
}

function handleBenefits($method, $conn) {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM benefits ORDER BY id ASC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($method === 'POST') {
        $data = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO benefits (title, description, icon) VALUES (?, ?, ?)");
        $stmt->execute([$data['title'], $data['description'], $data['icon']]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE benefits SET title=?, description=?, icon=? WHERE id=?");
        $stmt->execute([$data['title'], $data['description'], $data['icon'], $_GET['id']]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $id = getJsonInput()['id'] ?? $_GET['id'] ?? null;
        $stmt = $conn->prepare("DELETE FROM benefits WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
    }
}
?>
