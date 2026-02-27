-- SCRIPT DE SINCRONIZACIÓN Y BORRADO EN CASCADA
-- Asegúrate de haber ejecutado primero setup_users_table.sql

-- 1. Añadimos la columna para vincular el jugador con su padre
ALTER TABLE players ADD COLUMN user_id INT DEFAULT NULL;

-- 2. Conectamos los jugadores existentes con sus padres a través del correo
UPDATE players p 
JOIN users u ON p.email = u.email 
SET p.user_id = u.id;

-- 3. Establecemos la regla estricta: Si se borra el padre, se borra el jugador
ALTER TABLE players 
ADD CONSTRAINT fk_user_player 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
