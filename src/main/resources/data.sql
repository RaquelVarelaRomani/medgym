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
INSERT INTO routine_exercises (description, routine_id, exercise_id) VALUES
    ('3 series de 12 repeticiones', 1, 1), -- sentadillas
    ('3 series de 10 repeticiones', 1, 2), -- flexiones
    ('4 series de 8 repeticiones', 1, 7), -- peso muerto
    ('3 series de 8 repeticiones', 1, 8); -- press banca

-- Rutina 2: cardio avanzado
INSERT INTO routine_exercises (description, routine_id, exercise_id) VALUES
    ('4 rondas de 15 repeticiones', 2, 3), -- burpees
    ('5 series de 1 minuto', 2, 6), -- saltos de comba
    ('5 series de 30 segundos', 2, 10); -- mountain climbers

-- Rutina 3: cuerpo completo
INSERT INTO routine_exercises (description, routine_id, exercise_id) VALUES
    ('3 series de 12 repeticiones', 3, 1), -- sentadillas
    ('3 series de 10 repeticiones', 3, 2), -- flexiones
    ('3 series de 10 repeticiones', 3, 5), -- zancadas
    ('3 series de 6 repeticiones', 3, 9); -- dominadas

-- Rutina 4: yoga relajación
INSERT INTO routine_exercises (description, routine_id, exercise_id) VALUES
    ('Mantener 3 minutos', 4, 4); -- plancha abdominal