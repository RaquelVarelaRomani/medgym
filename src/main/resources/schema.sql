DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS users;



CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50)  NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture MEDIUMBLOB,
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
    visibility TINYINT NOT NULL,

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
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    creator_id BIGINT,

    CONSTRAINT exercise_id_pk PRIMARY KEY (id),
    CONSTRAINT exercise_creator_id_fk FOREIGN KEY (creator_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE routine_exercises (
    id BIGINT NOT NULL AUTO_INCREMENT,
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    position INT,

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

CREATE TABLE workouts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    routine_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    CONSTRAINT workout_id_pk PRIMARY KEY (id),
    CONSTRAINT workout_routine_id_fk FOREIGN KEY (routine_id)
        REFERENCES routines (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT workout_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE workout_exercises (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reps SMALLINT,
    weight SMALLINT,
    duration_seconds SMALLINT,
    workout_id BIGINT NOT NULL,
    routine_exercise_id BIGINT NOT NULL,

    CONSTRAINT workout_exercise_id_pk PRIMARY KEY (id),
    CONSTRAINT workout_exercise_workout_id_fk FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT workout_exercise_routine_exercise_id_fk FOREIGN KEY (routine_exercise_id)
        REFERENCES routine_exercises(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE user_follows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    trainer_id BIGINT NOT NULL,

    CONSTRAINT fk_user_follow_client FOREIGN KEY (client_id) REFERENCES users(id)
         ON DELETE CASCADE,
    CONSTRAINT fk_user_follow_trainer FOREIGN KEY (trainer_id) REFERENCES users(id)
         ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    routine_id BIGINT,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT notification_id_pk PRIMARY KEY (id),
    CONSTRAINT notification_routine_id_fk FOREIGN KEY (routine_id)
      REFERENCES routines(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL,
    CONSTRAINT notification_user_id_fk FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
);

