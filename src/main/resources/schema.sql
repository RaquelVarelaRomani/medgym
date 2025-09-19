DROP TABLE IF EXISTS routine_exercise;
DROP TABLE IF EXISTS exercise;
DROP TABLE IF EXISTS `routine`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50)  NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role TINYINT NOT NULL,

    CONSTRAINT user_id_pk PRIMARY KEY (id),
    CONSTRAINT user_email_uk UNIQUE (email),
    CONSTRAINT user_phoneNumber_uk UNIQUE (phoneNumber)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `routine` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    trainerId BIGINT NOT NULL,

    CONSTRAINT routine_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_trainerId_fk FOREIGN KEY (trainerId)
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
    repetitionsNumber SMALLINT NOT NULL,
    duration SMALLINT NOT NULL,
    routineId BIGINT NOT NULL,
    exerciseId BIGINT NOT NULL,

    CONSTRAINT routine_exercise_id_pk PRIMARY KEY (id),
    CONSTRAINT routine_exercise_routineId_fk FOREIGN KEY (routineId)
        REFERENCES routine(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_exerciseId_fk FOREIGN KEY (exerciseId)
        REFERENCES exercise(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT routine_exercise_routineId_exerciseId_uk UNIQUE (routineId, exerciseId)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
