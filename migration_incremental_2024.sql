-- INCREMENTAL MIGRATION - UNIÓN JAGUERA (CORREGIDO)
-- Objetivo: Implementar Suscripciones, Pausas y Paz y Salvo

-- 1. Tabla de Suscripciones del Club ($20.000 mensual)
-- Solo aplica para categorías Sub-13 en adelante
CREATE TABLE IF NOT EXISTS club_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    amount DECIMAL(15,2) DEFAULT 20000.00,
    status ENUM('Pendiente', 'Pagado') DEFAULT 'Pendiente',
    payment_id INT DEFAULT NULL, -- Relación opcional con la tabla de pagos existente para trazabilidad
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 2. Configuración de Calendario de Cobros (Maestro de meses activos)
CREATE TABLE IF NOT EXISTS billing_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- FALSE representa "Pausa" o Vacaciones
    description VARCHAR(255),
    UNIQUE KEY unique_month_year (month, year)
);

-- 3. Tabla de Convenios de Jugadores
CREATE TABLE IF NOT EXISTS player_conventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00, -- Cuánto se descuenta del valor base de $200.000
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 4. Solicitudes de Paz y Salvo
CREATE TABLE IF NOT EXISTS peace_and_safety_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pendiente', 'En revisión', 'Aprobado', 'Rechazado', 'Generado') DEFAULT 'Pendiente',
    
    -- Instantánea financiera al momento de la solicitud
    monthly_debt DECIMAL(15,2) DEFAULT 0.00,
    subscription_debt DECIMAL(15,2) DEFAULT 0.00,
    base_value DECIMAL(15,2) DEFAULT 200000.00,
    convention_discount DECIMAL(15,2) DEFAULT 0.00,
    total_to_pay DECIMAL(15,2) DEFAULT 0.00,
    
    approved_by INT DEFAULT NULL,
    rejection_reason TEXT,
    pdf_path VARCHAR(255) DEFAULT NULL,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Historial de Documentos (Opcional pero recomendado para auditoría)
CREATE TABLE IF NOT EXISTS peace_and_safety_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES peace_and_safety_requests(id) ON DELETE CASCADE
);

-- Insertar configuración inicial (Diciembre/Enero desactivados por defecto)
INSERT IGNORE INTO billing_calendar (month, year, is_active, description) VALUES 
(12, 2024, FALSE, 'Vacaciones - Diciembre'),
(1, 2025, FALSE, 'Vacaciones - Enero'),
(2, 2025, TRUE, 'Febrero Activo'),
(3, 2025, TRUE, 'Marzo Activo');
