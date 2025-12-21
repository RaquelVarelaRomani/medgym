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
VALUES (1, 1, 'CARDIO', 1),   -- Sentadillas (como Cardio)
       (1, 2, 'STRENGTH', 2), -- Flexiones
       (1, 7, 'STRENGTH', 3), -- Peso muerto
       (1, 8, 'STRENGTH', 4); -- Press banca

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (2, 3, 'CARDIO', 1),   -- Burpees
       (2, 6, 'CARDIO', 2),   -- Saltos de comba
       (2, 10, 'CARDIO', 3);  -- Mountain climbers

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (3, 1, 'CARDIO', 1),   -- Sentadillas (como Cardio)
       (3, 2, 'STRENGTH', 2), -- Flexiones
       (3, 5, 'STRENGTH', 3), -- Zancadas
       (3, 9, 'STRENGTH', 4); -- Dominadas

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (routine_id, exercise_id, exercise_type, position)
VALUES (4, 4, 'CARDIO', 1);   -- Plancha abdominal

INSERT INTO workouts (start_time, end_time, routine_id, user_id)
VALUES
    -- Laura (cliente id=2) siguiendo rutina de fuerza inicial
    ('2025-09-20 19:30:00', '2025-09-20 20:10:00', 1, 2),
    ('2025-09-22 19:00:00', '2025-09-22 19:50:00', 1, 2),

    -- Miguel (cliente id=3) haciendo cardio avanzado
    ('2025-09-19 07:30:00', '2025-09-19 08:10:00', 2, 3),
    ('2025-09-21 07:45:00', '2025-09-21 08:20:00', 2, 3),

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
    (
        TIMESTAMPADD(MINUTE, 1, CAST(DATEADD('DAY', -1, CURRENT_DATE) AS TIMESTAMP)),
        TIMESTAMPADD(MINUTE, 2, CAST(DATEADD('DAY', -1, CURRENT_DATE) AS TIMESTAMP)),
        3,
        2
    ),
    (
        TIMESTAMPADD(MINUTE, 1, CAST(DATEADD('DAY', -2, CURRENT_DATE) AS TIMESTAMP)),
        TIMESTAMPADD(MINUTE, 2, CAST(DATEADD('DAY', -2, CURRENT_DATE) AS TIMESTAMP)),
        1,
        2
    ),
    (
        TIMESTAMPADD(MINUTE, 1, CAST(CURRENT_DATE AS TIMESTAMP)),
        NULL,
        1,
        2
    ),
    ('2025-11-04 08:00:00', '2025-11-04 08:45:00', 2, 2),
    ('2025-11-12 18:30:00', '2025-11-12 19:15:00', 2, 2),
    ('2025-11-20 19:00:00', '2025-11-20 20:00:00', 1, 2),
    ('2025-12-15 10:00:00', '2025-12-15 11:00:00', 1, 3);

INSERT INTO workout_exercises (reps, weight, duration_seconds, workout_id, routine_exercise_id)
VALUES
-- Workout 1 (Laura, Rutina 1)
(NULL, NULL, 60, 1, 1), (12, 0, NULL, 1, 2), (8, 40, NULL, 1, 3), (10, 30, NULL, 1, 4),
-- Workout 2 (Laura, Rutina 1)
(NULL, NULL, 70, 2, 1), (15, 0, NULL, 2, 2), (8, 45, NULL, 2, 3), (10, 35, NULL, 2, 4),
-- Workout 3 (Miguel, Rutina 2)
(NULL, NULL, 45, 3, 5), (NULL, NULL, 60, 3, 6), (NULL, NULL, 30, 3, 7),
-- Workout 4 (Miguel, Rutina 2)
(NULL, NULL, 50, 4, 5), (NULL, NULL, 90, 4, 6), (NULL, NULL, 40, 4, 7),
-- Workout 6 (Antiguo prueba, Rutina 1)
(NULL, NULL, 50, 6, 1), (10, 0, NULL, 6, 2), (5, 30, NULL, 6, 3),
-- Workout 7 (Miguel 16-Oct, Rutina 2)
(NULL, NULL, 60, 7, 5), (NULL, NULL, 120, 7, 6), (NULL, NULL, 60, 7, 7),
-- Workout 8 (Laura 16-Oct, Rutina 4)
(NULL, NULL, 180, 8, 12),
-- Workout 9 (Laura 05-Oct, Rutina 1)
(NULL, NULL, 80, 9, 1), (12, 5, NULL, 9, 2), (8, 50, NULL, 9, 3), (10, 40, NULL, 9, 4),
-- Workout 10 (Laura 08-Oct, Rutina 3)
(NULL, NULL, 90, 10, 8), (10, 0, NULL, 10, 9), (12, 10, NULL, 10, 10), (5, 0, NULL, 10, 11),
-- Workout 11 (Laura 12-Oct, Rutina 1)
(NULL, NULL, 85, 11, 1), (12, 5, NULL, 11, 2), (8, 55, NULL, 11, 3), (10, 45, NULL, 11, 4),
-- Workout 12 (Laura 15-Oct, Rutina 1)
(NULL, NULL, 90, 12, 1), (15, 5, NULL, 12, 2), (8, 60, NULL, 12, 3), (10, 45, NULL, 12, 4),
-- Workout 13 (Laura 17-Oct, Rutina 3)
(NULL, NULL, 100, 13, 8), (12, 0, NULL, 13, 9), (12, 15, NULL, 13, 10), (6, 0, NULL, 13, 11),
-- Workout 14 (Laura 20-Oct, Rutina 1)
(NULL, NULL, 95, 14, 1), (15, 10, NULL, 14, 2), (8, 65, NULL, 14, 3), (10, 50, NULL, 14, 4),
-- Workout 15 (Laura Ayer, Rutina 3)
(NULL, NULL, 110, 15, 8), (12, 0, NULL, 15, 9), (12, 20, NULL, 15, 10), (8, 0, NULL, 15, 11),
-- Workout 16 (Laura Antes de Ayer, Rutina 1)
(NULL, NULL, 100, 16, 1), (15, 10, NULL, 16, 2), (8, 70, NULL, 16, 3), (10, 55, NULL, 16, 4),
-- Workout 17 (Laura Hoy - En progreso/Iniciada, Rutina 1)
(NULL, NULL, 30, 17, 1),
-- Workout 18 (Laura 04-Nov, Rutina 2)
(NULL, NULL, 60, 18, 5), (NULL, NULL, 120, 18, 6), (NULL, NULL, 60, 18, 7),
-- Workout 19 (Laura 12-Nov, Rutina 2)
(NULL, NULL, 65, 19, 5), (NULL, NULL, 130, 19, 6), (NULL, NULL, 65, 19, 7),
-- Workout 20 (Laura 20-Nov, Rutina 1)
(NULL, NULL, 120, 20, 1), (15, 15, NULL, 20, 2), (10, 75, NULL, 20, 3), (10, 60, NULL, 20, 4),
-- Workout 21 (Miguel 15-Diciembre, Rutina fuerza)
(NULL, NULL, 60, 21, 1), (12, 0, NULL, 21, 2), (8, 50, NULL, 21, 3), (10, 40, NULL, 21, 4);


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
VALUES (1, 1), -- Carlos sobre entrenamiento de Laura
       (1, 3), -- Miguel sobre entrenamiento de Laura
       (3, 2), -- Laura sobre entrenamiento de Miguel
       (3, 1); -- Carlos sobre entrenamiento de Miguel

-- Comentarios: el autor nunca comenta su propio workout
INSERT INTO workout_comments (text, date, workout_id, user_id)
VALUES ('Buena sesión, ritmo suave pero constante.', '2025-02-01 19:42:00', 1, 4),
       ('Postura controlada y estable durante todo el entrenamiento.', '2025-02-01 19:45:00', 1, 2),

       ('Trabajo sólido, especialmente en la fase final.', '2025-01-28 18:03:00', 3, 2),

       ('Respiración muy bien acompañada del movimiento.', '2025-02-04 07:55:00', 4, 5),
       ('Mejora visible respecto a la semana pasada.', '2025-02-04 08:00:00', 4, 1),
       ('Fluidez general muy buena en los cambios.', '2025-02-04 08:04:00', 4, 5),

       ('Buena activación desde el calentamiento.', '2025-01-30 17:12:00', 2, 1),
       ('Control de tempo adecuado.', '2025-01-30 17:14:00', 2, 3),
       ('Buen enfoque en técnica más que en peso. Correcto.', '2025-01-30 17:16:00', 2, 5),
       ('La estabilidad lumbar destaca.', '2025-01-30 17:19:00', 2, 2),
       ('Buen cierre, sin aceleraciones innecesarias.', '2025-01-30 17:22:00', 2, 5),

       ('Sesión eficiente y sin derroches energéticos.', '2025-02-06 20:31:00', 4, 2),
       ('Transiciones muy limpias.', '2025-02-06 20:33:00', 4, 4),
       ('Respiración acompasada todo el tiempo.', '2025-02-06 20:35:00', 4, 3),
       ('Tono muscular estable durante todo el bloque.', '2025-02-06 20:36:00', 4, 5),
       ('Muy buena combinación de ejercicios en cadena posterior.', '2025-02-06 20:38:00', 4, 1),
       ('Se nota disciplina en progresión.', '2025-02-06 20:41:00', 4, 5),

       ('Ritmo sostenido en movimientos complejos.', '2025-02-02 21:45:00', 5, 2),
       ('Técnica más pulida que la semana pasada.', '2025-02-02 21:48:00', 5, 4),
       ('Buen autoajuste de carga sin perder forma.', '2025-02-02 21:50:00', 5, 5),
       ('Concentración constante.', '2025-02-02 21:52:00', 5, 1),
       ('Estabilidad de cadera notable.', '2025-02-02 21:55:00', 5, 5),
       ('Control respiratorio ejemplar.', '2025-02-02 21:58:00', 5, 3),
       ('La sesión se ve muy bien estructurada.', '2025-02-02 22:00:00', 5, 2),
       ('Buen foco en movilidad en las transiciones.', '2025-02-02 22:02:00', 5, 4),
       ('Fluidez y calma en la ejecución.', '2025-02-02 22:05:00', 5, 5),
       ('Nada de compensaciones, muy limpio.', '2025-02-02 22:08:00', 5, 1);

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
