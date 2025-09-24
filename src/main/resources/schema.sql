DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50)  NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role TINYINT NOT NULL,

    CONSTRAINT user_id_pk PRIMARY KEY (id),
    CONSTRAINT user_email_uk UNIQUE (email),
    CONSTRAINT user_phone_number_uk UNIQUE (phone_number)
);

CREATE TABLE routines (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    trainer_id BIGINT NOT NULL,

    CONSTRAINT routine_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_trainer_id_fk FOREIGN KEY (trainer_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE exercises (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    CONSTRAINT exercise_id_pk PRIMARY KEY (id)
);

CREATE TABLE routine_exercises (
    id BIGINT NOT NULL AUTO_INCREMENT,
    description TEXT,
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,

    CONSTRAINT routine_exercise_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_exercise_routine_id_fk FOREIGN KEY (routine_id)
        REFERENCES routines(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_exercise_id_fk FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_routine_id_exercise_id_uk UNIQUE (routine_id, exercise_id)
);