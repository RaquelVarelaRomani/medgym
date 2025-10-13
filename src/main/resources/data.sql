-- Insertar usuarios (roles: 0 = cliente, 1 = entrenador, 2 = admin; status: 0 = ACTIVE, 1 = BLOCKED)
INSERT INTO users (name, surname, email, phone_number, password, profile_picture, role, status) VALUES
    ('Carlos', 'Gómez', 'carlos.gomez@example.com', '600111222', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/carlos.jpg'), 1, 0), -- entrenador
    ('Laura', 'Martínez', 'laura.martinez@example.com', '600333444', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/laura.jpg'), 0, 0), -- cliente
    ('Miguel', 'Fernández', 'miguel.fernandez@example.com', '600555666', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/miguel.jpg'), 0, 0), -- cliente
    ('Sofía', 'López', 'sofia.lopez@example.com', '600777888', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/sofia.jpg'), 1, 0), -- entrenadora
    ('Ana', 'Torres', 'ana.torres@example.com', '600999000', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/ana.jpg'), 2, 0); -- admin

-- Insertar rutinas (entrenadores: Carlos id=1, Sofía id=4)
INSERT INTO routines (name, description, trainer_id, visibility) VALUES
    ('Rutina fuerza inicial', 'Entrenamiento básico de fuerza con pesas libres. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Peso muerto (3 series de 8 reps)\n- Press banca (3 series de 10 reps).', 1, 0),
    ('Rutina cardio avanzado', 'Sesión intensiva de cardio de alta intensidad. Incluye:\n- Burpees (3 series de 30 segundos)\n- Saltos de comba (3 series de 1 minuto)\n- Mountain climbers (3 series de 45 segundos).', 1, 0),
    ('Rutina cuerpo completo', 'Ejercicios generales para trabajar todo el cuerpo. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Zancadas (3 series de 10 reps por pierna)\n- Dominadas (3 series de 8 reps).', 4, 0),
    ('Rutina yoga relajación', 'Rutina de yoga y estiramientos para relajación. Incluye:\n- Plancha abdominal (mantener 3 series de 30 segundos).', 4, 0),
    ('Rutina privada Carlos', 'Rutina privada de fuerza avanzada para clientes premium. Incluye ejercicios intensos de fuerza.', 1, 1);

-- Insertar ejercicios
-- Insertar ejercicios (con nuevos campos muscle_group, equipment, image)
INSERT INTO exercises (name, description, muscle_group, equipment, image, creator_id, status) VALUES
    ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.', 'Piernas', 'Ninguno',LOAD_FILE('/var/lib/mysql-files/sentadilla.jpg'), 1, 'APPROVED'),
    ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.', 'Pectorales', 'Ninguno', LOAD_FILE('/var/lib/mysql-files/flexiones.jpg'), 4, 'APPROVED'),
    ('Burpees', 'Ejercicio completo que combina fuerza y cardio.', 'Full body', 'Ninguno', LOAD_FILE('/var/lib/mysql-files/burpees.jpg'), 1, 'APPROVED'),
    ('Plancha abdominal', 'Ejercicio isométrico para el core.', 'Core', 'Esterilla', LOAD_FILE('/var/lib/mysql-files/plancha.jpg'), 4, 'APPROVED'),
    ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.', 'Piernas', 'Ninguno', LOAD_FILE('/var/lib/mysql-files/zancadas.jpg'), 1, 'APPROVED'),
    ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.', 'Full body', 'Comba', LOAD_FILE('/var/lib/mysql-files/salto_comba.jpg'), 4, 'APPROVED'),
    ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.', 'Espalda', 'Barra', LOAD_FILE('/var/lib/mysql-files/peso_muerto.jpg'), 1, 'APPROVED'),
    ('Press banca', 'Ejercicio de fuerza para el pecho.', 'Pectorales', 'Banco y barra', LOAD_FILE('/var/lib/mysql-files/press_banca.jpg'), 4, 'APPROVED'),
    ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.', 'Espalda', 'Barra de dominadas', LOAD_FILE('/var/lib/mysql-files/dominadas.jpg'), 1, 'APPROVED'),
    ('Mountain climbers', 'Ejercicio de cardio y core.', 'Core', 'Ninguno', LOAD_FILE('/var/lib/mysql-files/mountain_climbers.jpg'), 4, 'APPROVED'),
    ('Curl de bíceps', 'Ejercicio para trabajar los bíceps.', 'Bíceps', 'Mancuernas', LOAD_FILE('/var/lib/mysql-files/curl_biceps.jpg'), 1, 'PENDING'),
    ('Extensiones de tríceps', 'Ejercicio para trabajar los tríceps.', 'Tríceps', 'Polea', LOAD_FILE('/var/lib/mysql-files/extensiones_triceps.jpg'), 1, 'REJECTED'),
    ('Elevaciones laterales', 'Ejercicio para hombros.', 'Hombros', 'Mancuernas', LOAD_FILE('/var/lib/mysql-files/elevaciones_laterales.jpg'), 4, 'PENDING'),
    ('Remo con mancuerna', 'Ejercicio para espalda.', 'Espalda', 'Mancuerna', LOAD_FILE('/var/lib/mysql-files/remo_mancuerna.jpg'), 4, 'REJECTED');


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

INSERT INTO workouts (start_time, end_time, routine_id, user_id) VALUES
    -- Carlos (entrenador id=1) probando su rutina
    ('2025-09-15 08:00:00', '2025-09-15 09:00:00', 1, 1),
    ('2025-09-18 08:00:00', '2025-09-18 09:05:00', 1, 1),

    -- Laura (cliente id=2) siguiendo rutina de fuerza inicial
    ('2025-09-20 19:30:00', '2025-09-20 20:10:00', 1, 2),
    ('2025-09-22 19:00:00', '2025-09-22 19:50:00', 1, 2),

    -- Miguel (cliente id=3) haciendo cardio avanzado
    ('2025-09-19 07:30:00', '2025-09-19 08:10:00', 2, 3),
    ('2025-09-21 07:45:00', '2025-09-21 08:20:00', 2, 3),
    ('2025-10-01 07:30:00', NULL, 2, 3), -- sesión en curso

    -- Sofía (entrenadora id=4) probando su rutina de yoga
    ('2025-09-25 18:00:00', '2025-09-25 18:45:00', 4, 4),

    -- Ana (admin id=5) probando rutina de cuerpo completo
    ('2025-09-23 09:00:00', '2025-09-23 09:50:00', 3, 5),
    ('2025-10-02 09:15:00', NULL, 3, 5), -- aún no finalizada

    -- Laura (cliente) probando rutina de yoga de Sofía
    ('2025-10-05 21:00:00', NULL, 4, 2),

    -- Miguel (cliente) probando rutina privada de Carlos
    ('2025-10-03 18:00:00', '2025-10-03 19:00:00', 5, 3),

    -- Entrenamiento antiguo de prueba
    ('2025-08-10 10:00:00', '2025-08-10 11:00:00', 1, 2),

    -- Workout activo para testing (hoy mismo)
    ('2025-10-13 14:00:00', NULL, 1, 2); -- Laura con rutina de fuerza inicial

INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id) VALUES
    (12, 60, 45, 1, 3),
    (10, 50, 40, 1, 4),
    (8, 70, 55, 2, 2),
    (15, 30, 35, 2, 1),
    (10, 40, 30, 3, 5),
    (20, 25, 25, 3, 6),
    (6, 80, 60, 4, 7),
    (12, 55, 42, 4, 8),
    (10, 65, 50, 4, 9),
    (8, 75, 48, 5, 10),
    (14, 35, 33, 5, 1),
    (10, 45, 38, 2, 6),
    (9, 50, 52, 3, 2);
