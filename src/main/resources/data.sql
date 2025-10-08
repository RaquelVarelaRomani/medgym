-- Insertar usuarios (roles: 0 = cliente, 1 = entrenador, 2 = admin)
INSERT INTO users (name, surname, email, phone_number, password, profile_picture, role) VALUES
    ('Carlos', 'Gómez', 'carlos.gomez@example.com', '600111222', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/carlos.jpg'), 1), -- entrenador
    ('Laura', 'Martínez', 'laura.martinez@example.com', '600333444', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/laura.jpg'), 0), -- cliente
    ('Miguel', 'Fernández', 'miguel.fernandez@example.com', '600555666', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/miguel.jpg'), 0), -- cliente
    ('Sofía', 'López', 'sofia.lopez@example.com', '600777888', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/sofia.jpg'), 1), -- entrenadora
    ('Ana', 'Torres', 'ana.torres@example.com', '600999000', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/ana.jpg'), 2); -- admin

-- Insertar rutinas (entrenadores: Carlos id=1, Sofía id=4)
INSERT INTO routines (name, description, trainer_id, visibility) VALUES
    ('Rutina fuerza inicial', 'Entrenamiento básico de fuerza con pesas libres. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Peso muerto (3 series de 8 reps)\n- Press banca (3 series de 10 reps).', 1, 0),
    ('Rutina cardio avanzado', 'Sesión intensiva de cardio de alta intensidad. Incluye:\n- Burpees (3 series de 30 segundos)\n- Saltos de comba (3 series de 1 minuto)\n- Mountain climbers (3 series de 45 segundos).', 1, 0),
    ('Rutina cuerpo completo', 'Ejercicios generales para trabajar todo el cuerpo. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Zancadas (3 series de 10 reps por pierna)\n- Dominadas (3 series de 8 reps).', 4, 0),
    ('Rutina yoga relajación', 'Rutina de yoga y estiramientos para relajación. Incluye:\n- Plancha abdominal (mantener 3 series de 30 segundos).', 4, 0),
    ('Rutina privada Carlos', 'Rutina privada de fuerza avanzada para clientes premium. Incluye ejercicios intensos de fuerza.', 1, 1);

-- Insertar ejercicios
INSERT INTO exercises (name, description, creator_id, status) VALUES
    ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.', 1, 'APPROVED'),
    ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.', 4, 'APPROVED'),
    ('Burpees', 'Ejercicio completo que combina fuerza y cardio.', 1, 'APPROVED'),
    ('Plancha abdominal', 'Ejercicio isométrico para el core.', 4, 'APPROVED'),
    ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.', 1, 'APPROVED'),
    ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.', 4, 'APPROVED'),
    ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.', 1, 'APPROVED'),
    ('Press banca', 'Ejercicio de fuerza para el pecho.', 4, 'APPROVED'),
    ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.', 1, 'APPROVED'),
    ('Mountain climbers', 'Ejercicio de cardio y core.', 4, 'APPROVED'),
    ('Curl de bíceps', 'Ejercicio para trabajar los bíceps.', 1, 'PENDING'),
    ('Extensiones de tríceps', 'Ejercicio para trabajar los tríceps.', 1, 'REJECTED'),
    ('Elevaciones laterales', 'Ejercicio para hombros.', 4, 'PENDING'),
    ('Remo con mancuerna', 'Ejercicio para espalda.', 4, 'REJECTED');

-- Insertar relación rutina-ejercicios
-- Rutina 1: fuerza inicial
INSERT INTO routine_exercises (routine_id, exercise_id, position) VALUES
    (1, 1, 1),
    (1, 2, 2),
    (1, 7, 3),
    (1, 8, 4);

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (routine_id, exercise_id, position) VALUES
    (2, 3, 1),
    (2, 6, 2),
    (2, 10, 3);

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (routine_id, exercise_id, position) VALUES
    (3, 1, 1),
    (3, 2, 2),
    (3, 5, 3),
    (3, 9, 4);

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (routine_id, exercise_id, position) VALUES
    (4, 4, 1);