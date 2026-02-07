<?php
require_once 'config.php';

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit;
}

// Validar campos requeridos
if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['message'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Primero: Guardar en base de datos (esto es más confiable)
try {
    $conn = getConn();
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at, read_status) VALUES (?, ?, ?, ?, ?, NOW(), 0)");
    $stmt->execute([
        $data['name'],
        $data['email'],
        $data['phone'] ?? 'No proporcionado',
        $data['subject'],
        $data['message']
    ]);
    
    $messageId = $conn->lastInsertId();
    
    // El mensaje se guardó en la base de datos exitosamente
    $dbSaved = true;
    
} catch (Exception $e) {
    error_log("Failed to save contact message to DB: " . $e->getMessage());
    $dbSaved = false;
    // Continuamos para intentar enviar el correo
}

// Configuración SMTP para Hostinger
// IMPORTANTE: Cambia estos valores según la configuración de tu cuenta de correo en Hostinger
$smtpHost = 'smtp.hostinger.com'; // O el servidor SMTP de tu hosting
$smtpPort = 587; // Puerto típico para SMTP con STARTTLS
$smtpUser = 'union_user@unionjaguera.com';
$smtpPass = ''; // ⚠️ DEBES PONER LA CONTRASEÑA DE TU CORREO AQUÍ

// Destinatario
$to = "union_user@unionjaguera.com";

// Construir el mensaje
$subject = "Nuevo mensaje desde el sitio web: " . $data['subject'];

$htmlMessage = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1fa774; color: white; padding: 20px; text-align: center; }
        .content { background: #f4f4f4; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Nuevo Mensaje de Contacto</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Nombre:</span><br>
                <span class='value'>" . htmlspecialchars($data['name']) . "</span>
            </div>
            <div class='field'>
                <span class='label'>Email:</span><br>
                <span class='value'>" . htmlspecialchars($data['email']) . "</span>
            </div>
            <div class='field'>
                <span class='label'>Teléfono:</span><br>
                <span class='value'>" . htmlspecialchars($data['phone'] ?? 'No proporcionado') . "</span>
            </div>
            <div class='field'>
                <span class='label'>Asunto:</span><br>
                <span class='value'>" . htmlspecialchars($data['subject']) . "</span>
            </div>
            <div class='field'>
                <span class='label'>Mensaje:</span><br>
                <span class='value'>" . nl2br(htmlspecialchars($data['message'])) . "</span>
            </div>
        </div>
    </div>
</body>
</html>
";

// Headers para correo HTML simple
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Union Jaguera <union_user@unionjaguera.com>" . "\r\n";
$headers .= "Reply-To: " . $data['email'] . "\r\n";

// Intentar enviar el correo
$mailSent = @mail($to, $subject, $htmlMessage, $headers);

// Respuesta basada en resultados
if ($dbSaved) {
    // Al menos se guardó en la base de datos
    echo json_encode([
        "status" => "success", 
        "message" => "Tu mensaje ha sido recibido correctamente",
        "info" => [
            "saved_to_db" => true,
            "email_sent" => $mailSent,
            "message_id" => $messageId ?? null
        ]
    ]);
} else if ($mailSent) {
    // Solo se envió por correo
    echo json_encode([
        "status" => "success", 
        "message" => "Mensaje enviado",
        "info" => [
            "saved_to_db" => false,
            "email_sent" => true
        ]
    ]);
} else {
    // Nada funcionó
    error_log("Contact form failed completely. From: " . $data['email']);
    echo json_encode([
        "status" => "error", 
        "message" => "Error al procesar tu mensaje. Por favor contáctanos directamente.",
        "debug" => [
            "db_saved" => $dbSaved,
            "mail_sent" => $mailSent
        ]
    ]);
}
?>
