# Despliegue en Hostinger — Unión Jeguera

¡Todo está listo! Sigue estos pasos para poner tu sitio en línea:

## 1. Base de Datos
*   Crea una base de datos en Hostinger.
*   Importa los archivos SQL que están en la carpeta `sql/` (o los de la raíz de este paquete):
    1.  `database_setup.sql` (Esquema general)
    2.  `contact_messages_table.sql` (Para el buzón)
    3.  `benefits_table.sql` (Beneficios de categorías)

## 2. Conexión a la Base de Datos
*   Abre el archivo `api/db_connect.php`.
*   Asegúrate de que los campos `$db`, `$user` y `$pass` coincidan con los que creaste en Hostinger. (Actualmente ya tienen los valores `u671193113_unio_db` y `u671193113_union_10`).

## 3. Subir Archivos
*   Sube **TODO** el contenido de la carpeta `deploy_package/` a la carpeta `public_html/` de tu servidor.
*   La estructura final debe verse así:
    *   `public_html/index.html`
    *   `public_html/assets/`
    *   `public_html/api/`
    *   `public_html/.htaccess`
    *   `public_html/uploads/`

## 4. Permisos
*   Crea la carpeta `uploads` dentro de `api/` (si no existe) o mantén la carpeta `uploads/` en la raíz.
*   Asegúrate de que la carpeta de subidas tenga permisos **755** o **775** para que las fotos de los jugadores se guarden correctamente.

## 5. Accesos Administrador
Recuerda tus nuevas credenciales:
*   **Contenido**: Usuario: `union` / Clave: `union3023`
*   **Finanzas**: Usuario: `roma` / Clave: `302304`

## 6. Buzón de Contacto
*   Los mensajes llegarán automáticamente a: `union_user@unionjaguera.com`.
*   También puedes consultarlos directamente en la tabla `contact_messages` de tu base de datos.
