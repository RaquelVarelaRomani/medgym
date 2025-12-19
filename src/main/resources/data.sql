-- Insertar usuarios (roles: 0 = cliente, 1 = entrenador, 2 = admin; status: 0 = ACTIVE, 1 = BLOCKED)
INSERT INTO users (name, surname, email, phone_number, password, profile_picture, role, status)
VALUES ('Carlos', 'Gómez', 'carlos.gomez@example.com', '600111222',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', NULL, 1,
        0), -- entrenador
       ('Laura', 'Martínez', 'laura.martinez@example.com', '600333444',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', NULL, 0,
        0), -- cliente
       ('Miguel', 'Fernández', 'miguel.fernandez@example.com', '600555666',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', NULL, 0,
        0), -- cliente
       ('Sofía', 'López', 'sofia.lopez@example.com', '600777888',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', NULL, 1,
        0), -- entrenadora
       ('Ana', 'Torres', 'ana.torres@example.com', '600999000',
        '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', NULL, 2,
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

-- Insertar ejercicios (con nuevos campos muscle_group, equipment, image)
INSERT INTO exercises (name, description, muscle_group, equipment, image, creator_id, status)
VALUES ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.', 'LEG', 'NONE', NULL, 1, 'APPROVED'),
       ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.', 'CHEST', 'NONE', NULL, 4, 'APPROVED'),
       ('Burpees', 'Ejercicio completo que combina fuerza y cardio.', 'FULL_BODY', 'NONE', NULL, 1, 'APPROVED'),
       ('Plancha abdominal', 'Ejercicio isométrico para el core.', 'CORE', 'MAT', NULL, 4, 'APPROVED'),
       ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.', 'LEG', 'NONE', NULL, 1, 'APPROVED'),
       ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.', 'FULL_BODY', 'JUMP_ROPE', NULL, 4, 'APPROVED'),
       ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.', 'BACK', 'BARBELL', NULL, 1, 'APPROVED'),
       ('Press banca', 'Ejercicio de fuerza para el pecho.', 'CHEST', 'BENCH_AND_BARBELL', NULL, 4, 'APPROVED'),
       ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.', 'BACK', 'PULL_UP_BAR', NULL, 1, 'APPROVED'),
       ('Mountain climbers', 'Ejercicio de cardio y core.', 'CORE', 'NONE', NULL, 4, 'APPROVED'),
       ('Curl de bíceps', 'Ejercicio para trabajar los bíceps.', 'BICEPS', 'DUMBBELL', NULL, 1, 'PENDING'),
       ('Extensiones de tríceps', 'Ejercicio para trabajar los tríceps.', 'TRICEPS', 'PULLEY', NULL, 1, 'REJECTED'),
       ('Elevaciones laterales', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL', NULL, 4, 'PENDING'),
       ('Elevaciones laterales 2', 'Ejercicio para hombros.', 'SHOULDERS', 'DUMBBELL', NULL, 4, 'BLOCKED'),
       ('Remo con mancuerna', 'Ejercicio para espalda.', 'BACK', 'DUMBBELL', NULL, 4, 'REJECTED');

-- Insertar relación rutina-ejercicios
-- Rutina 1: fuerza inicial
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (1, 1, 'CARDIO', 1),
       (1, 2, 'STRENGTH', 2),
       (1, 7, 'CARDIO', 3),
       (1, 8, 'STRENGTH', 4);

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (2, 3, 'CARDIO', 1),
       (2, 6, 'STRENGTH', 2),
       (2, 10, 'STRENGTH', 3);

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (3, 1, 'CARDIO', 1),
       (3, 2, 'CARDIO', 2),
       (3, 5, 'STRENGTH', 3),
       (3, 9, 'CARDIO', 4);

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (4, 4, 'STRENGTH', 1);

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
    ('2025-10-20 19:00:00', '2025-10-20 19:50:00', 1, 2),
    -- 1. Entrenamiento de Laura ayer (Racha 1)
    (CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 00:01:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 00:02:00'), 3, 2),

    -- 2. Entrenamiento de Laura anteayer (Racha 2)
    (CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 00:01:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 00:02:00'), 1, 2),

    -- 3. Entrenamiento de Laura Hoy (Racha 3)
    (CONCAT(CURDATE(), ' 00:01:00'), NULL, 1, 2);

INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id)
VALUES
-- workout 1
(NULL, NULL, 45, 1, 3),   -- CARDIO
(10, 50, NULL, 1, 4),    -- STRENGTH

-- workout 2
(8, 70, NULL, 2, 2),     -- STRENGTH
(NULL, NULL, 35, 2, 1),  -- CARDIO
(10, 45, NULL, 2, 6),    -- STRENGTH

-- workout 3
(10, 40, NULL, 3, 5),    -- STRENGTH
(20, 25, NULL, 3, 6),    -- STRENGTH
(9, 50, NULL, 3, 2),     -- STRENGTH

-- workout 4
(6, 80, NULL, 4, 7),     -- STRENGTH
(NULL, NULL, 42, 4, 8),  -- CARDIO
(NULL, NULL, 50, 4, 9),  -- CARDIO

-- workout 5
(8, 75, NULL, 5, 10),    -- STRENGTH
(NULL, NULL, 33, 5, 1),  -- CARDIO

-- Datos de Laura en octubre
-- workout 14
(NULL, NULL, 40, 14, 3), -- CARDIO
(10, 55, NULL, 14, 4),   -- STRENGTH
(8, 65, NULL, 14, 2),    -- STRENGTH

-- workout 15
(5, 28, NULL, 15, 4),    -- STRENGTH
(NULL, NULL, 25, 15, 1), -- CARDIO

-- workout 16
(NULL, NULL, 42, 16, 3), -- CARDIO
(10, 48, NULL, 16, 4),   -- STRENGTH
(8, 60, NULL, 16, 2),    -- STRENGTH

-- workout 17
(NULL, NULL, 40, 17, 3), -- CARDIO
(10, 55, NULL, 17, 4),   -- STRENGTH
(8, 65, NULL, 17, 2),    -- STRENGTH

-- workout 18
(5, 32, NULL, 18, 4),    -- STRENGTH
(NULL, NULL, 28, 18, 1), -- CARDIO

-- workout 19
(NULL, NULL, 42, 19, 3), -- CARDIO
(10, 48, NULL, 19, 4),   -- STRENGTH

-- workout 21 (Rutina fuerza inicial)
(NULL, NULL, 40, 21, 1), -- CARDIO
(12, 0, NULL, 21, 2),    -- STRENGTH
(NULL, NULL, 50, 21, 3), -- CARDIO
(10, 45, NULL, 21, 4),   -- STRENGTH

-- workout 20 (Rutina cuerpo completo)
(NULL, NULL, 35, 20, 9), -- CARDIO
(12, 0, NULL, 20, 10),   -- STRENGTH
(10, 0, NULL, 20, 11),   -- STRENGTH
(5, 0, NULL, 20, 12);    -- STRENGTH


INSERT INTO user_follows (client_id, follow_user_id)
VALUES (3, 1),
       (3, 4),
       (3, 2),
       (2, 1),
       (2, 3);


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

-- Contenido random coherente para exercise_max_weights
-- Carlos (1), Laura (2), Miguel (3), Sofía (4), Ana (5)
INSERT INTO exercise_max_weights (max_weight_kg, user_id, exercise_id)
VALUES
    -- SENTADILLAS (exercise_id = 1)
    (95, 1, 1),   -- Carlos
    (85, 2, 1),   -- Laura
    (70, 3, 1),   -- Miguel
    (55, 4, 1),   -- Sofía
    (80, 5, 1),   -- Ana

    -- PRESS BANCA (exercise_id = 8)
    (75, 1, 8),   -- Carlos
    (60, 2, 8),   -- Laura
    (82, 5, 8),   -- Ana
    (50, 3, 8),   -- Miguel
    (40, 4, 8),   -- Sofía

    -- PESO MUERTO (exercise_id = 7)
    (110, 1, 7),  -- Carlos
    (95, 5, 7),   -- Ana
    (70, 3, 7),   -- Miguel
    (65, 2, 7),   -- Laura
    (55, 4, 7),   -- Sofía

    -- DOMINADAS CON LASTRE (exercise_id = 9)
    (25, 1, 9),   -- Carlos
    (12, 3, 9),   -- Miguel
    (18, 5, 9),   -- Ana
    (8, 4, 9),    -- Sofía
    (10, 2, 9),   -- Laura

    -- ZANCADAS (exercise_id = 5)
    (55, 4, 5),   -- Sofía
    (65, 1, 5),   -- Carlos
    (50, 2, 5),   -- Laura
    (45, 3, 5),   -- Miguel
    (58, 5, 5);   -- Ana
