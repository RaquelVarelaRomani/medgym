DROP TABLE IF EXISTS routine_exercise;
DROP TABLE IF EXISTS exercise;
DROP TABLE IF EXISTS `routine`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
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
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `routine` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    trainer_id BIGINT NOT NULL,

    CONSTRAINT routine_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_trainer_id_fk FOREIGN KEY (trainer_id)
        REFERENCES `user`(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exercise (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,

    CONSTRAINT exercise_id_pk PRIMARY KEY (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE routine_exercise (
    id BIGINT NOT NULL AUTO_INCREMENT,
    repetitions_number SMALLINT NOT NULL,
    duration SMALLINT NOT NULL,
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,

    CONSTRAINT routine_exercise_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_exercise_routine_id_fk FOREIGN KEY (routine_id)
        REFERENCES routine(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_exercise_id_fk FOREIGN KEY (exercise_id)
        REFERENCES exercise(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_routine_exercise_uk UNIQUE (routine_id, exercise_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
