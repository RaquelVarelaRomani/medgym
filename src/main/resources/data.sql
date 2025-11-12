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
    ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.', 'LEG', 'NONE', LOAD_FILE('/var/lib/mysql-files/sentadilla.jpg'), 1, 'APPROVED'),
    ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.', 'CHEST', 'NONE', LOAD_FILE('/var/lib/mysql-files/flexiones.jpg'), 4, 'APPROVED'),
    ('Burpees', 'Ejercicio completo que combina fuerza y cardio.', 'FULL_BODY', 'NONE', LOAD_FILE('/var/lib/mysql-files/burpees.jpg'), 1, 'APPROVED'),
    ('Plancha abdominal', 'Ejercicio isométrico para el core.', 'CORE', 'MAT', LOAD_FILE('/var/lib/mysql-files/plancha.jpg'), 4, 'APPROVED'),
    ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.', 'LEG', 'NONE', LOAD_FILE('/var/lib/mysql-files/zancadas.jpg'), 1, 'APPROVED'),
    ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.', 'FULL_BODY', 'JUMP_ROPE', LOAD_FILE('/var/lib/mysql-files/salto_comba.jpg'), 4, 'APPROVED'),
    ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.', 'BACK', 'BARBELL', LOAD_FILE('/var/lib/mysql-files/peso_muerto.jpg'), 1, 'APPROVED'),
    ('Press banca', 'Ejercicio de fuerza para el pecho.', 'CHEST', 'BENCH_AND_BARBELL', LOAD_FILE('/var/lib/mysql-files/press_banca.jpg'), 4, 'APPROVED'),
    ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.', 'BACK', 'PULL_UP_BAR', LOAD_FILE('/var/lib/mysql-files/dominadas.jpg'), 1, 'APPROVED'),
    ('Mountain climbers', 'Ejercicio de cardio y core.', 'CORE', 'NONE', LOAD_FILE('/var/lib/mysql-files/mountain_climbers.jpg'), 4, 'APPROVED'),
    ('Curl de bíceps', 'Ejercicio para trabajar los bíceps.', 'BICEPS', 'DUMBBELL', LOAD_FILE('/var/lib/mysql-files/curl_biceps.jpg'), 1, 'PENDING'),
    ('Extensiones de tríceps', 'Ejercicio para trabajar los tríceps.', 'TRICEPS', 'PULLEY', LOAD_FILE('/var/lib/mysql-files/extensiones_triceps.jpg'), 1, 'REJECTED'),
    ('Elevaciones laterales', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL', LOAD_FILE('/var/lib/mysql-files/elevaciones_laterales.jpg'), 4, 'PENDING'),
    ('Elevaciones laterales 2', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL', LOAD_FILE('/var/lib/mysql-files/elevaciones_laterales.jpg'), 4, 'BLOCKED'),
    ('Remo con mancuerna', 'Ejercicio para espalda.', 'BACK', 'DUMBBELL', LOAD_FILE('/var/lib/mysql-files/remo_mancuerna.jpg'), 4, 'REJECTED');

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

    -- Sofía (entrenadora id=4) probando su rutina de yoga
    ('2025-09-25 18:00:00', '2025-09-25 18:45:00', 4, 4),

    -- Ana (admin id=5) probando rutina de cuerpo completo
    ('2025-09-23 09:00:00', '2025-09-23 09:50:00', 3, 5),
    ('2025-10-02 09:15:00', '2025-10-02 09:50:00', 3, 5),

    -- Miguel (cliente) probando rutina privada de Carlos
    ('2025-10-03 18:00:00', '2025-10-03 19:00:00', 5, 3),

    -- Entrenamiento antiguo de prueba
    ('2025-08-10 10:00:00', '2025-08-10 11:00:00', 1, 2),

    -- Activos
    ('2025-10-16 07:30:00', NULL, 2, 3),
    ('2025-10-16 21:00:00', NULL, 4, 2),

    -- Laura (cliente id=2) datos de octubre
    ('2025-10-05 19:30:00', '2025-10-05 20:15:00', 1, 2),
    ('2025-10-08 19:00:00', '2025-10-08 19:45:00', 3, 2),
    ('2025-10-12 19:30:00', '2025-10-12 20:20:00', 1, 2),
    ('2025-10-15 19:30:00', '2025-10-15 20:15:00', 1, 2),
    ('2025-10-17 19:30:00', '2025-10-17 20:15:00', 3, 2),
    ('2025-10-20 19:00:00', '2025-10-20 19:50:00', 1, 2);

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
    (9, 50, 52, 3, 2),
    -- Datos de Laura en octubre (workout_id 14-19)
    (12, 45, 40, 14, 3),
    (10, 55, 38, 14, 4),
    (8, 65, 50, 14, 2),
    (5, 28, 20, 15, 4),
    (6, 32, 25, 15, 1),
    (12, 50, 42, 16, 3),
    (10, 48, 38, 16, 4),
    (8, 60, 48, 16, 2),
    (12, 45, 40, 17, 3),
    (10, 55, 38, 17, 4),
    (8, 65, 50, 17, 2),
    (5, 32, 18, 18, 4),
    (7, 35, 28, 18, 1),
    (12, 50, 42, 19, 3),
    (10, 48, 38, 19, 4);

INSERT INTO user_follows (client_id, follow_user_id)
VALUES
    (3, 1),
    (3, 4),
    (2, 1);

INSERT INTO notifications (message, type, id_to_redirect, user_id, is_read, date)
VALUES
    -- Notificación por nueva rutina publicada (NEW_ROUTINE = 0)
    ('Nueva rutina: Rutina fuerza inicial', 0, 1, 2, FALSE, '2025-10-15 08:00:00'),
    ('Nueva rutina: Rutina cardio avanzado', 0, 2, 3, FALSE, '2025-10-15 08:05:00'),

    -- Notificación por follow (FOLLOW = 1)
    ('Miguel Fernández ha comenzado a seguirte', 1, NULL, 1, FALSE, '2025-10-15 09:00:00'),
    ('Laura Martínez ha comenzado a seguirte', 1, NULL, 1, TRUE, '2025-10-14 17:45:00'),
    ('Miguel Fernández ha comenzado a seguirte', 1, NULL, 4, FALSE, '2025-10-13 19:20:00'),

    -- Notificación por like en rutina (LIKE = 2)
    ("Laura ha dado like a tu rutina 'Rutina fuerza inicial'", 2, 1, 1, FALSE, '2025-10-16 09:00:00'),
    ("Miguel ha dado like a tu rutina 'Rutina cardio avanzado'", 2, 2, 1, FALSE, '2025-10-16 09:10:00'),
    ("Ana ha dado like a tu rutina 'Rutina cuerpo completo'", 2, 3, 4, TRUE, '2025-10-16 09:15:00');


INSERT INTO routine_likes (routine_id, user_id) VALUES
    (1, 2),
    (2, 2),
    (3, 3),
    (4, 3),
    (1, 5),
    (3, 5),
    (4, 1),
    (2, 4);


-- Likes
INSERT INTO workout_likes (workout_id, user_id) VALUES
    (1, 2),  -- Laura sobre entrenamiento de Carlos
    (1, 3),  -- Miguel sobre entrenamiento de Carlos
    (3, 1),  -- Carlos sobre entrenamiento de Laura
    (4, 3),  -- Miguel sobre entrenamiento de Laura
    (5, 2),  -- Laura sobre entrenamiento de Miguel
    (7, 5),  -- Ana sobre entrenamiento de Sofía
    (8, 3),  -- Miguel sobre entrenamiento de Ana
    (10, 4); -- Sofía sobre entrenamiento de Miguel

-- Comentarios: el autor nunca comenta su propio workout
INSERT INTO workout_comments (text, workout_id, user_id) VALUES
    ('Buena ejecución en sentadillas. Ritmo estable.', 1, 2),
    ('Se ve mejora respecto a la sesión pasada.', 1, 3),

    ('Progresión sólida. Mantén técnica en press banca.', 3, 1),
    ('Buen control respiratorio en esta sesión.', 3, 4),

    ('Cardio intenso. Buen cierre de series.', 5, 2),
    ('Notable resistencia, ritmo constante.', 5, 1),

    ('Sesión muy equilibrada y relajante.', 7, 5),
    ('Transiciones limpias. Flujo constante.', 7, 2),

    ('Buen enfoque en espalda. Repetir configuración.', 8, 3),
    ('Movimiento controlado en cargas medias.', 8, 4),

    ('Progresión clara. Ajustar peso en próxima sesión.', 10, 2),
    ('Buena técnica en fases finales.', 10, 5);
