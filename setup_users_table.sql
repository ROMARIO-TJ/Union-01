-- TABLA DE USUARIOS ACTUALIZADA (SOPORTE PARA USERNAME CORTO)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    photo TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, username, email, password, role) VALUES 
('Administración Unión Jeguera', 'union', 'union@unionjaguera.com', 'union3023', 'admin_contenido'),
('Finanzas Unión Jeguera', 'roma', 'roma@unionjaguera.com', '302304', 'admin_financiero');
