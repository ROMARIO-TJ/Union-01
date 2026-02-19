CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    `date` VARCHAR(50), -- Cambiado de date_str
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100),
    homeTeam VARCHAR(100),
    awayTeam VARCHAR(100),
    `date` VARCHAR(50), -- Cambiado de date_str
    `time` VARCHAR(20), -- Cambiado de time_str
    stadium VARCHAR(100),
    homeScore INT DEFAULT NULL,
    awayScore INT DEFAULT NULL,
    status ENUM('scheduled', 'finished') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(50),
    schedule VARCHAR(255),
    `time` VARCHAR(100),
    coach VARCHAR(100),
    icon VARCHAR(50),
    teamImage VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    age INT,
    category VARCHAR(100),
    registrationDate DATE,
    status ENUM('Pendiente', 'Aceptado', 'Rechazado') DEFAULT 'Pendiente',
    photo VARCHAR(255),
    dniImage VARCHAR(255),
    documentType VARCHAR(50),
    birthDate DATE,
    medicalCertificate VARCHAR(255),
    parentName VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(100),
    icon VARCHAR(50),
    type ENUM('photo', 'video') DEFAULT 'photo',
    url VARCHAR(255),
    videoUrl VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos por defecto
INSERT INTO users (username, password) VALUES ('union', 'Anasophia302304');
