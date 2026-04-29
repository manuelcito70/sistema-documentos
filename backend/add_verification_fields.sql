-- Script para agregar campos de verificación a la tabla Users
-- Ejecutar si la sincronización automática de Sequelize no funcionó

-- 1. Agregar columna isVerified
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false NOT NULL;

-- 2. Agregar columna verificationToken
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "verificationToken" VARCHAR(255);

-- 3. Actualizar usuarios existentes para que estén verificados (opcional, para no bloquearlos)
UPDATE "Users" SET "isVerified" = true WHERE "isVerified" IS FALSE;
