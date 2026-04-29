-- Script para migrar a la nueva tabla de verificación
-- Ejecutar en pgAdmin

-- 1. Crear tabla VerificationTokens
CREATE TABLE IF NOT EXISTS "VerificationTokens" (
    "id" SERIAL,
    "token" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- 2. Eliminar columna antigua (opcional, pero limpio)
ALTER TABLE "Users" DROP COLUMN IF EXISTS "verificationToken";

-- 3. Asegurar que isVerified existe (por si acaso)
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false NOT NULL;
