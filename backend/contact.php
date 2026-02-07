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

// Email del club - Correo de Hostinger
$to = "union_user@unionjaguera.com";

// Construir el mensaje
$subject = "Nuevo mensaje desde el sitio web: " . $data['subject'];

$message = "
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
                <span class='value'>" . htmlspecialchars($data['phone']) . "</span>
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

// Headers para enviar HTML - Usando el correo de Hostinger
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Union Jaguera <union_user@unionjaguera.com>" . "\r\n";
$headers .= "Reply-To: " . $data['email'] . "\r\n";

// Intentar enviar el correo
$mailSent = @mail($to, $subject, $message, $headers);

if ($mailSent) {
    // Opcional: Guardar en base de datos para historial
    try {
        $conn = getConn();
        $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['subject'],
            $data['message']
        ]);
    } catch (Exception $e) {
        // Si falla guardar en DB, no importa, el correo sí se envió
        error_log("Failed to save contact message to DB: " . $e->getMessage());
    }
    
    echo json_encode([
        "status" => "success", 
        "message" => "Message sent successfully",
        "debug" => "Email sent to: " . $to
    ]);
} else {
    // Log the error
    error_log("Failed to send contact email. To: $to, From: " . $data['email']);
    
    echo json_encode([
        "status" => "error", 
        "message" => "No se pudo enviar el correo. Verifica la configuración del servidor.",
        "debug" => [
            "mail_function_exists" => function_exists('mail'),
            "to" => $to,
            "subject" => $subject
        ]
    ]);
}
?>
