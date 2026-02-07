-- Create benefits table
CREATE TABLE IF NOT EXISTS benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial benefits
INSERT INTO benefits (id, title, description, icon) VALUES
(1, 'Formación Integral', 'Desarrollo técnico, táctico y humano', 'fa-solid fa-trophy'),
(2, 'Entrenadores Certificados', 'Profesionales con experiencia comprobada', 'fa-solid fa-users'),
(3, 'Instalaciones de Calidad', 'Canchas y equipamiento adecuado', 'fa-solid fa-futbol'),
(4, 'Ambiente Familiar', 'Valores de respeto y compañerismo', 'fa-solid fa-heart')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), icon=VALUES(icon);
