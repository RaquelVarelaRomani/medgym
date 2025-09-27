-- Insertar usuarios (roles: 0 = cliente, 1 = entrenador, 2 = admin)
INSERT INTO users (name, surname, email, phone_number, password, role) VALUES
    ('Carlos', 'Gómez', 'carlos.gomez@example.com', '600111222', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', 1), -- entrenador
    ('Laura', 'Martínez', 'laura.martinez@example.com', '600333444', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', 0), -- cliente
    ('Miguel', 'Fernández', 'miguel.fernandez@example.com', '600555666', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', 0), -- cliente
    ('Sofía', 'López', 'sofia.lopez@example.com', '600777888', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', 1), -- entrenadora
    ('Ana', 'Torres', 'ana.torres@example.com', '600999000', '$2a$10$WZKg4rDofawZDLYC3XNhg.DWpTJOtNZiZKlMyOYeMyGv9m2ccoGIS', 2); -- admin

-- Insertar rutinas (entrenadores: Carlos id=1, Sofía id=4)
INSERT INTO routines (name, description, trainer_id) VALUES
    ('Rutina fuerza inicial', 'Entrenamiento básico de fuerza con pesas libres.', 1),
    ('Rutina cardio avanzado', 'Sesión intensiva de cardio de alta intensidad.', 1),
    ('Rutina cuerpo completo', 'Ejercicios generales para trabajar todo el cuerpo.', 4),
    ('Rutina yoga relajación', 'Rutina de yoga y estiramientos para relajación.', 4);

-- Insertar ejercicios
INSERT INTO exercises (name, description) VALUES
    ('Sentadillas', 'Ejercicio para trabajar las piernas y glúteos.'),
    ('Flexiones', 'Ejercicio de empuje para trabajar pectorales y tríceps.'),
    ('Burpees', 'Ejercicio completo que combina fuerza y cardio.'),
    ('Plancha abdominal', 'Ejercicio isométrico para el core.'),
    ('Zancadas', 'Ejercicio unilateral para trabajar las piernas.'),
    ('Saltos de comba', 'Cardio con cuerda, mejora la resistencia.'),
    ('Peso muerto', 'Ejercicio compuesto para espalda baja y femorales.'),
    ('Press banca', 'Ejercicio de fuerza para el pecho.'),
    ('Dominadas', 'Ejercicio de tracción para espalda y bíceps.'),
    ('Mountain climbers', 'Ejercicio de cardio y core.');

-- Insertar relación rutina-ejercicios
-- Rutina 1: fuerza inicial
INSERT INTO routine_exercises (routine_id, exercise_id, description, position) VALUES
    (1, 1, '3 series de 12 repeticiones', 1),
    (1, 2, '3 series de 15 repeticiones', 2),
    (1, 7, '4 series de 10 repeticiones', 3),
    (1, 8, '3 series de 12 repeticiones', 4);

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (routine_id, exercise_id, description, position) VALUES
    (2, 3, '5 series de 10 repeticiones', 1),
    (2, 6, '10 minutos', 2),
    (2, 10, '3 series de 20 repeticiones', 3);

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (routine_id, exercise_id, description, position) VALUES
    (3, 1, '3 series de 15 repeticiones', 1),
    (3, 2, '3 series al fallo', 2),
    (3, 5, '3 series de 12 repeticiones por pierna', 3),
    (3, 9, '4 series al fallo', 4);

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (routine_id, exercise_id, description, position) VALUES
    (4, 4, '3 series de 1 minuto', 1);