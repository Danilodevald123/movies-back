SELECT 'CREATE DATABASE conexa_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'conexa_db')\gexec

\c conexa_db;

SELECT 'Base de datos conexa_db creada exitosamente' as status;
