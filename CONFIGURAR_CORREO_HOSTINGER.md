# Configurar Correo union_user@unionjaguera.com en Hostinger

## Paso 1: Crear la cuenta de correo en Hostinger

1. Accede al **hPanel** (panel de control de Hostinger).
2. Ve a **Emails** → **Email Accounts**.
3. Haz clic en **Create Email Account**.
4. Completa:
   - **Email**: `union_user@unionjaguera.com`
   - **Password**: Elige una contraseña segura (guárdala).
   - Otras opciones: deja por defecto.
5. Haz clic en **Create**.

## Paso 2: Configurar parámetros SMTP (si necesitas SMTP)

Por defecto, Hostinger usa **mail()** de PHP, que es más simple. Pero si quieres SMTP (recomendado para mayor confiabilidad):

1. En hPanel, ve a **Emails** → **Email Accounts**.
2. Selecciona `union_user@unionjaguera.com` y busca "SMTP settings" o similar.
3. Anota los parámetros:
   - **SMTP Host**: `smtp.hostinger.com` (o el que indique Hostinger)
   - **SMTP Port**: `465` (SSL) o `587` (TLS)
   - **SMTP User**: `union_user@unionjaguera.com`
   - **SMTP Password**: La contraseña que creaste.

## Paso 3: Actualizar archivos en el servidor

### Opción A: Usar mail() (por defecto, más simple)

- `api/contact.php` ya está configurado para usar `union_user@unionjaguera.com`.
- Los formularios de contacto enviarán mensajes a ese correo automáticamente.
- **No necesita cambios adicionales si mail() funciona en Hostinger.**

### Opción B: Usar SMTP (si mail() no funciona)

1. En el servidor, edita `api/contact_v2.php`:
   ```php
   $SMTP_HOST = 'smtp.hostinger.com';
   $SMTP_PORT = 587;
   $SMTP_USER = 'union_user@unionjaguera.com';
   $SMTP_PASS = 'TU_CONTRASEÑA_AQUI';
   $SMTP_FROM = 'union_user@unionjaguera.com';
   ```

2. En el frontend (`src/views/Contacto.vue`), cambia la URL del POST a:
   ```javascript
   const response = await fetch('/api/contact_v2.php', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData)
   });
   ```

3. O usa una biblioteca PHP SMTP como PHPMailer (instalable via Composer).

## Paso 4: Verificar que funciona

### Test 1: Usar el script de diagnóstico

1. Accede a `https://tu-dominio.com/api/test_email.php`.
2. Verifica el resultado:
   - ✅ Si ves "mail() devolvió TRUE": Los correos se están enviando.
   - ❌ Si ves "mail() devolvió FALSE": Intenta SMTP o contacta a soporte de Hostinger.

### Test 2: Enviar un formulario de contacto real

1. Ve a tu sitio web → Página de **Contacto**.
2. Rellena y envía un formulario.
3. Revisa tu correo `union_user@unionjaguera.com` (incluyendo carpeta de SPAM).
4. Si no llega después de 5 minutos, prueba opciones 3 y 4 abajo.

### Test 3: Revisar logs de Hostinger

1. hPanel → **File Manager** → Ve a la raíz de tu dominio.
2. Busca una carpeta `logs` o `error_logs`.
3. Abre `error.log` y busca mensajes de correo.

### Test 4: Contactar a soporte de Hostinger

Si nada funciona, abre un ticket con:
- "El formulario de contacto de mi sitio web no envía correos."
- Pregunta si tienen habilitada la función `mail()` o si debo usar SMTP.

## Paso 5: Limpieza y seguridad

- **Elimina `api/test_email.php`** una vez confirmes que funciona (por seguridad).
- No dejes contraseñas SMTP visibles en repositorios Git.
- Si usas SMTP, considera guardar credenciales en variables de entorno del servidor.

## Resumen de flujo

```
Usuario rellena formulario en web
    ↓
POST a /api/contact.php
    ↓
PHP envía con mail() a union_user@unionjaguera.com
    ↓
(Opcional) Guarda en contact_messages tabla
    ↓
Mensaje llega a tu correo
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "No data received" | El formulario no envía JSON o la solicitud es GET en vez de POST. |
| "Missing required fields" | Comprueba que name, email, subject, message están en el JSON. |
| Email no llega | Revisa SPAM, usa test_email.php, o prueba con SMTP. |
| Error 500 en /api/contact.php | Revisa error_log en Hostinger; puede ser fallo en BD (contact_messages). |
| SMTP conexión rechazada | Verifica SMTP_HOST, _PORT, _USER, _PASS; intenta puerto 465 vs 587. |

¿Necesitas que ajuste algo en los archivos o tienes dudas sobre los pasos?
