-- Database Schema for Union Jeguera

CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    date_str VARCHAR(50),
    image TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(50),
    icon VARCHAR(100),
    schedule VARCHAR(100),
    time VARCHAR(50),
    coach VARCHAR(100),
    teamImage TEXT
);

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value LONGTEXT
);

CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homeTeam VARCHAR(100),
    awayTeam VARCHAR(100),
    date_str VARCHAR(100),
    time_str VARCHAR(100),
    stadium VARCHAR(100),
    category VARCHAR(100),
    homeScore INT DEFAULT NULL,
    awayScore INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    birthDate DATE,
    age INT,
    category VARCHAR(100),
    parentName VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    photo TEXT,
    dniImage TEXT,
    documentType VARCHAR(100),
    medicalCertificate TEXT,
    status VARCHAR(50) DEFAULT 'Pendiente',
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    icon VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url TEXT NOT NULL,
    caption VARCHAR(255),
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    logo TEXT,
    url TEXT
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugadorId INT,
    tipo VARCHAR(50),
    mes INT,
    valor DECIMAL(15, 2),
    fecha DATE,
    metodo VARCHAR(100),
    FOREIGN KEY (jugadorId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255),
    valor DECIMAL(15, 2),
    fecha DATE
);

