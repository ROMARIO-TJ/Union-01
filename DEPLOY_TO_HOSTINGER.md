# Despliegue en Hostinger — Instrucciones rápidas

Pasos para desplegar este proyecto en Hostinger (PHP + MySQL):

1) Preparar base de datos
   - Crea una base de datos MySQL en el panel de Hostinger.
   - Importa los esquemas SQL (desde el administrador de base de datos o phpMyAdmin):
     - `database_setup.sql`
     - `contact_messages_table.sql`
     - `benefits_table.sql`

2) Configurar credenciales
   - Edita `api/config.php` y `backend/config.php` en el servidor y coloca tus credenciales reales:
     - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
   - Alternativa segura: define variables de entorno en el panel (si Hostinger lo permite) y deja los placeholders.

3) Archivos a subir
   - Contenido de `dist/` (resultado de `npm run build`) — archivos estáticos del frontend.
   - Carpeta `api/` completa (contiene `api.php`, `upload.php`, `contact.php`, etc.).
   - Archivos SQL de la raíz para referencia.

4) Estructura recomendada en Hostinger (public_html):
   - `public_html/index.html` ← contenido de `dist/index.html`
   - `public_html/assets/...` ← contenido estático de `dist`
   - `public_html/api/...` ← carpeta `api/` completa
   - `public_html/uploads/` ← carpeta de uploads (asegurar permisos 755/775 según Hostinger)

5) Reglas para SPA y API (`.htaccess`)
   - Añade el archivo `.htaccess` (se incluye aquí) en `public_html/` para enviar todas las rutas al `index.html`, excepto `/api/`.

6) Correo y formulario de contacto
   - Si usarás `api/contact_v2.php` con SMTP, pon la contraseña en `$smtpPass` o configura un transport SMTP real.
   - Usa `api/test_email.php` para diagnosticar envío (elimina después por seguridad).

7) Pruebas finales
   - Accede a tu dominio y prueba:
     - GET `https://tu-dominio.com/api/api.php?action=categories`
     - POST `https://tu-dominio.com/api/contact.php` (JSON)
     - POST `https://tu-dominio.com/api/upload.php` (form-data)

8) Seguridad y limpieza
   - Quita o restringe `api/test_email.php` después de las pruebas.
   - No dejes credenciales en el repositorio.

Si quieres, genero aquí el paquete zip con `dist/` + `api/` + SQL y el `.htaccess` listo para subir. ¿Lo creo? 
