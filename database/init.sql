-- ============================================================
-- Script SQL para crear la base de datos CatalogoDB
-- y el usuario de prueba en SQL Server
-- ============================================================
-- NOTA: Las tablas se crean automáticamente con las migraciones
--       de Entity Framework Core al arrancar el backend.
--       Este script es solo de referencia o para inicialización manual.

-- 1. Crear la base de datos (si no existe)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CatalogoDB')
BEGIN
    CREATE DATABASE CatalogoDB;
    PRINT 'Base de datos CatalogoDB creada.';
END
ELSE
    PRINT 'La base de datos CatalogoDB ya existe.';
GO

USE CatalogoDB;
GO

-- 2. Verificar si ya existe el usuario admin
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'admin@catalogo.com')
BEGIN
    -- Hash BCrypt de 'Admin123!' generado con work factor 11
    -- Para regenerar: BCrypt.Net.BCrypt.HashPassword("Admin123!")
    INSERT INTO Usuarios (Email, PasswordHash)
    VALUES (
        'admin@catalogo.com',
        '$2a$11$EJEMPLO_HASH_CAMBIAR_CON_HASH_REAL'
    );
    PRINT 'Usuario admin@catalogo.com creado.';
END
ELSE
    PRINT 'El usuario ya existe.';
GO

-- NOTA IMPORTANTE: El backend (Program.cs) ya realiza el seed automático
-- del usuario admin con BCrypt al iniciar por primera vez.
-- Este script es solo como referencia adicional.
-- Credenciales de demo:
--   Email:    admin@catalogo.com
--   Password: Admin123!
