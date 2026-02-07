<?php
// Script de diagnóstico para probar el envío de correos
// Accede a este archivo desde: https://unionjaguera.com/api/test_email.php

echo "<h1>Diagnóstico de Correos - Union Jaguera</h1>";

// 1. Verificar si la función mail() existe
echo "<h2>1. Función mail() de PHP:</h2>";
if (function_exists('mail')) {
    echo "✅ La función mail() está disponible<br>";
} else {
    echo "❌ La función mail() NO está disponible<br>";
}

// 2. Intentar enviar un correo de prueba
echo "<h2>2. Prueba de envío:</h2>";
$to = "union_user@unionjaguera.com";
$subject = "Prueba de correo desde unionjaguera.com";
$message = "Este es un mensaje de prueba. Si lo recibes, el sistema funciona.";
$headers = "From: Union Jaguera <union_user@unionjaguera.com>\r\n";
$headers .= "Content-type: text/plain; charset=UTF-8\r\n";

$result = @mail($to, $subject, $message, $headers);

if ($result) {
    echo "✅ mail() devolvió TRUE (parece exitoso)<br>";
    echo "📧 Revisa tu correo: $to<br>";
} else {
    echo "❌ mail() devolvió FALSE (falló)<br>";
}

// 3. Información del servidor
echo "<h2>3. Información del Servidor:</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";

// 4. Configuración de sendmail
echo "<h2>4. Configuración de Correo en PHP:</h2>";
echo "sendmail_path: " . ini_get('sendmail_path') . "<br>";
echo "SMTP: " . ini_get('SMTP') . "<br>";
echo "smtp_port: " . ini_get('smtp_port') . "<br>";

echo "<hr>";
echo "<p><strong>Instrucciones:</strong></p>";
echo "<ol>";
echo "<li>Si ves ✅ pero NO llega el correo: Hostinger puede estar bloqueando o retrasando los correos</li>";
echo "<li>Si ves ❌: La función mail() no funciona, necesitas configurar SMTP</li>";
echo "<li>Revisa también tu carpeta de SPAM</li>";
echo "<li>En Hostinger, verifica que el dominio esté verificado para enviar correos</li>";
echo "</ol>";

echo "<p style='color: red;'><strong>⚠️ IMPORTANTE: Elimina este archivo después de hacer la prueba por seguridad</strong></p>";
?>
