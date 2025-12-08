-- Insertar usuarios (roles: 0 = cliente, 1 = entrenador, 2 = admin; status: 0 = ACTIVE, 1 = BLOCKED)
INSERT INTO users (name, surname, email, phone_number, password, profile_picture, role, status)
VALUES ('Carlos', 'Gómez', 'carlos.gomez@example.com', '600111222',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/carlos.jpg'), 1,
        0), -- entrenador
       ('Laura', 'Martínez', 'laura.martinez@example.com', '600333444',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/laura.jpg'), 0,
        0), -- cliente
       ('Miguel', 'Fernández', 'miguel.fernandez@example.com', '600555666',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/miguel.jpg'), 0,
        0), -- cliente
       ('Sofía', 'López', 'sofia.lopez@example.com', '600777888',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/sofia.jpg'), 1,
        0), -- entrenadora
       ('Ana', 'Torres', 'ana.torres@example.com', '600999000',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', LOAD_FILE('/var/lib/mysql-files/ana.jpg'), 2,
        0);
-- admin

-- Insertar rutinas (entrenadores: Carlos id=1, Sofía id=4)
INSERT INTO routines (name, description, trainer_id, visibility)
VALUES ('Rutina fuerza inicial',
        'Rutina básica de fuerza con pesas libres. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Peso muerto (3 series de 8 reps)\n- Press banca (3 series de 10 reps).',
        1, 0),
       ('Rutina cardio avanzado',
        'Sesión intensiva de cardio de alta intensidad. Incluye:\n- Burpees (3 series de 30 segundos)\n- Saltos de comba (3 series de 1 minuto)\n- Mountain climbers (3 series de 45 segundos).',
        1, 0),
       ('Rutina cuerpo completo',
        'Ejercicios generales para trabajar todo el cuerpo. Incluye:\n- Sentadillas (3 series de 10 reps)\n- Flexiones (3 series de 12 reps)\n- Zancadas (3 series de 10 reps por pierna)\n- Dominadas (3 series de 8 reps).',
        4, 0),
       ('Rutina yoga relajación',
        'Rutina de yoga y estiramientos para relajación. Incluye:\n- Plancha abdominal (mantener 3 series de 30 segundos).',
        4, 0),
       ('Rutina privada Carlos',
        'Rutina privada de fuerza avanzada para clientes premium. Incluye ejercicios intensos de fuerza.', 1, 1);

-- Insertar ejercicios
-- Insertar ejercicios (con nuevos campos muscle_group, equipment, image)
INSERT INTO exercises (name, description, muscle_group, equipment, image, creator_id, status)
VALUES ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.', 'LEG', 'NONE',
        LOAD_FILE('/var/lib/mysql-files/sentadilla.jpg'), 1, 'APPROVED'),
       ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.', 'CHEST', 'NONE',
        LOAD_FILE('/var/lib/mysql-files/flexiones.jpg'), 4, 'APPROVED'),
       ('Burpees', 'Ejercicio completo que combina fuerza y cardio.', 'FULL_BODY', 'NONE',
        LOAD_FILE('/var/lib/mysql-files/burpees.jpg'), 1, 'APPROVED'),
       ('Plancha abdominal', 'Ejercicio isométrico para el core.', 'CORE', 'MAT',
        LOAD_FILE('/var/lib/mysql-files/plancha.jpg'), 4, 'APPROVED'),
       ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.', 'LEG', 'NONE',
        LOAD_FILE('/var/lib/mysql-files/zancadas.jpg'), 1, 'APPROVED'),
       ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.', 'FULL_BODY', 'JUMP_ROPE',
        LOAD_FILE('/var/lib/mysql-files/salto_comba.jpg'), 4, 'APPROVED'),
       ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.', 'BACK', 'BARBELL',
        LOAD_FILE('/var/lib/mysql-files/peso_muerto.jpg'), 1, 'APPROVED'),
       ('Press banca', 'Ejercicio de fuerza para el pecho.', 'CHEST', 'BENCH_AND_BARBELL',
        LOAD_FILE('/var/lib/mysql-files/press_banca.jpg'), 4, 'APPROVED'),
       ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.', 'BACK', 'PULL_UP_BAR',
        LOAD_FILE('/var/lib/mysql-files/dominadas.jpg'), 1, 'APPROVED'),
       ('Mountain climbers', 'Ejercicio de cardio y core.', 'CORE', 'NONE',
        LOAD_FILE('/var/lib/mysql-files/mountain_climbers.jpg'), 4, 'APPROVED'),
       ('Curl de bíceps', 'Ejercicio para trabajar los bíceps.', 'BICEPS', 'DUMBBELL',
        LOAD_FILE('/var/lib/mysql-files/curl_biceps.jpg'), 1, 'PENDING'),
       ('Extensiones de tríceps', 'Ejercicio para trabajar los tríceps.', 'TRICEPS', 'PULLEY',
        LOAD_FILE('/var/lib/mysql-files/extensiones_triceps.jpg'), 1, 'REJECTED'),
       ('Elevaciones laterales', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL',
        LOAD_FILE('/var/lib/mysql-files/elevaciones_laterales.jpg'), 4, 'PENDING'),
       ('Elevaciones laterales 2', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL',
        LOAD_FILE('/var/lib/mysql-files/elevaciones_laterales.jpg'), 4, 'BLOCKED'),
       ('Remo con mancuerna', 'Ejercicio para espalda.', 'BACK', 'DUMBBELL',
        LOAD_FILE('/var/lib/mysql-files/remo_mancuerna.jpg'), 4, 'REJECTED');

-- Insertar relación rutina-ejercicios
-- Rutina 1: fuerza inicial
INSERT INTO routine_exercises (routine_id, exercise_id, position)
VALUES (1, 1, 1),
       (1, 2, 2),
       (1, 7, 3),
       (1, 8, 4);

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (routine_id, exercise_id, position)
VALUES (2, 3, 1),
       (2, 6, 2),
       (2, 10, 3);

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (routine_id, exercise_id, position)
VALUES (3, 1, 1),
       (3, 2, 2),
       (3, 5, 3),
       (3, 9, 4);

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (routine_id, exercise_id, position)
VALUES (4, 4, 1);

INSERT INTO workouts (start_time, end_time, routine_id, user_id)
VALUES
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

    ('2025-10-16 07:30:00', '2025-10-16 08:30:00', 2, 3),
    ('2025-10-16 21:00:00', '2025-10-16 21:30:00', 4, 2),

    -- Laura (cliente id=2) datos de octubre
    ('2025-10-05 19:30:00', '2025-10-05 20:15:00', 1, 2),
    ('2025-10-08 19:00:00', '2025-10-08 19:45:00', 3, 2),
    ('2025-10-12 19:30:00', '2025-10-12 20:20:00', 1, 2),
    ('2025-10-15 19:30:00', '2025-10-15 20:15:00', 1, 2),
    ('2025-10-17 19:30:00', '2025-10-17 20:15:00', 3, 2),
    ('2025-10-20 19:00:00', '2025-10-20 19:50:00', 1, 2);

INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id)
VALUES (12, 60, 45, 1, 3),
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
VALUES (3, 1),
       (3, 4),
       (3, 2),
       (2, 1),
       (2, 3);

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


INSERT INTO routine_likes (routine_id, user_id)
VALUES (1, 2),
       (2, 2),
       (3, 3),
       (4, 3),
       (1, 5),
       (3, 5),
       (4, 1),
       (2, 4);


-- Likes
INSERT INTO workout_likes (workout_id, user_id)
VALUES (1, 2), -- Laura sobre entrenamiento de Carlos
       (1, 3), -- Miguel sobre entrenamiento de Carlos
       (3, 1), -- Carlos sobre entrenamiento de Laura
       (4, 3), -- Miguel sobre entrenamiento de Laura
       (5, 2), -- Laura sobre entrenamiento de Miguel
       (7, 5), -- Ana sobre entrenamiento de Sofía
       (8, 3), -- Miguel sobre entrenamiento de Ana
       (10, 4);
-- Sofía sobre entrenamiento de Miguel

-- Comentarios: el autor nunca comenta su propio workout
INSERT INTO workout_comments (text, date, workout_id, user_id)
VALUES ('Buena sesión, ritmo suave pero constante.', '2025-02-01 19:42:00', 3, 4),
       ('Postura controlada y estable durante todo el entrenamiento.', '2025-02-01 19:45:00', 3, 2),

       ('Trabajo sólido, especialmente en la fase final.', '2025-01-28 18:03:00', 5, 3),

       ('Respiración muy bien acompañada del movimiento.', '2025-02-04 07:55:00', 9, 5),
       ('Mejora visible respecto a la semana pasada.', '2025-02-04 08:00:00', 9, 1),
       ('Fluidez general muy buena en los cambios.', '2025-02-04 08:04:00', 9, 5),

       ('Buena activación desde el calentamiento.', '2025-01-30 17:12:00', 4, 1),
       ('Control de tempo adecuado.', '2025-01-30 17:14:00', 4, 3),
       ('Buen enfoque en técnica más que en peso. Correcto.', '2025-01-30 17:16:00', 4, 5),
       ('La estabilidad lumbar destaca.', '2025-01-30 17:19:00', 4, 2),
       ('Buen cierre, sin aceleraciones innecesarias.', '2025-01-30 17:22:00', 4, 5),

       ('Sesión eficiente y sin derroches energéticos.', '2025-02-06 20:31:00', 7, 2),
       ('Transiciones muy limpias.', '2025-02-06 20:33:00', 7, 4),
       ('Respiración acompasada todo el tiempo.', '2025-02-06 20:35:00', 7, 3),
       ('Tono muscular estable durante todo el bloque.', '2025-02-06 20:36:00', 7, 5),
       ('Muy buena combinación de ejercicios en cadena posterior.', '2025-02-06 20:38:00', 7, 1),
       ('Se nota disciplina en progresión.', '2025-02-06 20:41:00', 7, 5),

       ('Intensidad bien distribuida.', '2025-01-22 10:11:00', 1, 3),
       ('Muy buen control postural.', '2025-01-22 10:13:00', 1, 5),
       ('Entrada en calor progresiva y eficaz.', '2025-01-22 10:15:00', 1, 5),
       ('Transiciones estables entre ejercicios.', '2025-01-22 10:18:00', 1, 2),
       ('Rango de movimiento completo.', '2025-01-22 10:21:00', 1, 4),
       ('Técnica priorizada sobre carga. Correcto.', '2025-01-22 10:24:00', 1, 1),
       ('Buen manejo del esfuerzo en el último bloque.', '2025-01-22 10:26:00', 1, 3),
       ('Respiración diafragmática bien aplicada.', '2025-01-22 10:29:00', 1, 2),
       ('Fase excéntrica controlada.', '2025-01-22 10:32:00', 1, 5),
       ('Trabajo muy equilibrado en empuje y tracción.', '2025-01-22 10:35:00', 1, 5),
       ('Coherencia entre intención y ejecución.', '2025-01-22 10:37:00', 1, 4),
       ('Se nota experiencia.', '2025-01-22 10:40:00', 1, 3),

       ('Ritmo sostenido en movimientos complejos.', '2025-02-02 21:45:00', 10, 2),
       ('Técnica más pulida que la semana pasada.', '2025-02-02 21:48:00', 10, 4),
       ('Buen autoajuste de carga sin perder forma.', '2025-02-02 21:50:00', 10, 5),
       ('Concentración constante.', '2025-02-02 21:52:00', 10, 1),
       ('Estabilidad de cadera notable.', '2025-02-02 21:55:00', 10, 5),
       ('Control respiratorio ejemplar.', '2025-02-02 21:58:00', 10, 3),
       ('La sesión se ve muy bien estructurada.', '2025-02-02 22:00:00', 10, 2),
       ('Buen foco en movilidad en las transiciones.', '2025-02-02 22:02:00', 10, 4),
       ('Fluidez y calma en la ejecución.', '2025-02-02 22:05:00', 10, 5),
       ('Nada de compensaciones, muy limpio.', '2025-02-02 22:08:00', 10, 1);

INSERT INTO user_block (blocker_id, blocked_id)
VALUES (2, 3),
       (1, 3);

INSERT INTO achievements (name, description, bronze_req, silver_req, gold_req)
VALUES
    ('Cronista del Entreno',
     'Acumula horas activas',
     36000, 144000, 360000), -- IMPORTANTE: VALORES EN SEGUNDOS

    ('Coleccionista de Repeticiones',
     'Suma ejercicios completados',
     250, 1000, 2500),

    ('Completador de Sesiones',
     'Registra cada rutina terminada',
     5, 20, 50),

    ('Énfasis en el Hábito',
     'Completa días de entrenamiento consecutivos',
     3, 7, 30),

    ('Levantando el Gym',
     'Supera tu marca de peso levantado',
     50, 125, 250),

    ('Dando Likes',
     'Da likes a entrenamientos de otros usuarios',
     10, 50, 100),

    ('Comentando Entrenos',
     'Deja comentarios en entrenamientos de otros usuarios',
     5, 20, 50);



INSERT INTO workouts (start_time, end_time, routine_id, user_id)
VALUES
    -- 1. Entrenamiento de Laura ayer (Racha 1)
    (CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 00:01:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 00:02:00'), 3, 2),

    -- 2. Entrenamiento de Laura anteayer (Racha 2)
    (CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 00:01:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 00:02:00'), 1, 2),

    -- 3. Entrenamiento de Laura Hoy (Racha 3)
    (CONCAT(CURDATE(), ' 00:01:00'), NULL, 1, 2);

-- Laura (Workout 20 - Rutina 3: Cuerpo completo)
INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id)
VALUES (10, 40, 35, 20, 9),  -- Sentadillas
       (12, 0, 30, 20, 10), -- Flexiones
       (10, 0, 40, 20, 11), -- Zancadas
       (5, 0, 45, 20, 12);  -- Dominadas

-- Laura (Workout 21 - Rutina 1: Fuerza inicial)
INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id)
VALUES (10, 45, 40, 21, 1),  -- Sentadillas
       (12, 0, 30, 21, 2),  -- Flexiones
       (8, 60, 50, 21, 3),  -- Peso muerto
       (10, 45, 45, 21, 4); -- Press banca