SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS achievement_progresses;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS workout_comments;
DROP TABLE IF EXISTS workout_likes;
DROP TABLE IF EXISTS routine_likes;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS user_block;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users
(
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    name            VARCHAR(50)  NOT NULL,
    surname         VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(20)  NOT NULL,
    password        VARCHAR(255) NOT NULL,
    profile_picture MEDIUMBLOB,
    role            TINYINT      NOT NULL DEFAULT 0,
    status          TINYINT      NOT NULL DEFAULT 0,
    weight_kg       DOUBLE       NULL,
    height_cm       DOUBLE       NULL,
    gender          VARCHAR(20)  NULL,
    trainer_premium TINYINT(1)   NULL     DEFAULT NULL,
    CONSTRAINT pk_user PRIMARY KEY (id),
    CONSTRAINT uk_user_email UNIQUE (email),
    CONSTRAINT uk_user_phone_number UNIQUE (phone_number)
);

CREATE TABLE routines
(
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    name              VARCHAR(100) NOT NULL,
    description       TEXT         NOT NULL,
    creation_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    trainer_id        BIGINT       NOT NULL,
    visibility        TINYINT      NOT NULL,
    difficulty        TINYINT      NOT NULL DEFAULT 0,

    CONSTRAINT pk_routine PRIMARY KEY (id),
    CONSTRAINT fk_routine_trainer FOREIGN KEY (trainer_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE exercises
(
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    description  TEXT         NOT NULL,
    muscle_group VARCHAR(100),
    equipment    VARCHAR(100),
    image        MEDIUMBLOB,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    creator_id   BIGINT,

    CONSTRAINT pk_exercise PRIMARY KEY (id),
    CONSTRAINT fk_exercise_creator FOREIGN KEY (creator_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE routine_exercises
(
    id          BIGINT NOT NULL AUTO_INCREMENT,
    routine_id  BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    position    INT,

    CONSTRAINT pk_routine_exercise PRIMARY KEY (id),
    CONSTRAINT fk_routine_exercise_routine FOREIGN KEY (routine_id)
        REFERENCES routines (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_routine_exercise_exercise FOREIGN KEY (exercise_id)
        REFERENCES exercises (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uk_routine_exercise_routine_and_exercise UNIQUE (routine_id, exercise_id)
);

CREATE TABLE workouts
(
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time   DATETIME,
    routine_id BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,

    CONSTRAINT pk_workout PRIMARY KEY (id),
    CONSTRAINT fk_workout_routine FOREIGN KEY (routine_id)
        REFERENCES routines (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE workout_exercises
(
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    reps                SMALLINT,
    weight              SMALLINT,
    duration_seconds    SMALLINT,
    workout_id          BIGINT NOT NULL,
    routine_exercise_id BIGINT NOT NULL,

    CONSTRAINT pk_workout_exercise PRIMARY KEY (id),
    CONSTRAINT fk_workout_exercise_workout FOREIGN KEY (workout_id)
        REFERENCES workouts (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_exercise_routine_exercise FOREIGN KEY (routine_exercise_id)
        REFERENCES routine_exercises (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE user_follows
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id      BIGINT NOT NULL,
    follow_user_id BIGINT NOT NULL,

    CONSTRAINT fk_user_follow_client FOREIGN KEY (client_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_follow_user FOREIGN KEY (follow_user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE user_block
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE notifications
(
    id             BIGINT   NOT NULL AUTO_INCREMENT,
    message        TEXT     NOT NULL,
    type           TINYINT  NOT NULL,
    id_to_redirect BIGINT,
    user_id        BIGINT   NOT NULL,
    is_read        BOOLEAN  NOT NULL DEFAULT FALSE,
    date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_notification PRIMARY KEY (id),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE routine_likes
(
    id         BIGINT NOT NULL AUTO_INCREMENT,
    routine_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,

    CONSTRAINT pk_routine_likes PRIMARY KEY (id),
    CONSTRAINT fk_routine_likes_routine FOREIGN KEY (routine_id)
        REFERENCES routines (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_routine_likes_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE workout_likes
(
    id         BIGINT NOT NULL AUTO_INCREMENT,
    workout_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,

    CONSTRAINT pk_workout_likes PRIMARY KEY (id),
    CONSTRAINT fk_workout_likes_workout FOREIGN KEY (workout_id)
        REFERENCES workouts (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_likes_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE workout_comments
(
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    text       TEXT     NOT NULL,
    date       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    workout_id BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,

    CONSTRAINT pk_workout_comments PRIMARY KEY (id),
    CONSTRAINT fk_workout_comments_workout FOREIGN KEY (workout_id)
        REFERENCES workouts (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_comments_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE achievements
(
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(128)    NOT NULL,
    description TEXT            NOT NULL,
    bronze_req  INTEGER         NOT NULL,
    silver_req  INTEGER         NOT NULL,
    gold_req    INTEGER         NOT NULL,

    CONSTRAINT pk_achievements PRIMARY KEY (id)
);

CREATE TABLE achievement_progresses
(
    id              BIGINT  NOT NULL AUTO_INCREMENT,
    progress        INTEGER NOT NULL,
    highest_progress INTEGER NOT NULL,
    user_id         BIGINT  NOT NULL,
    achievement_id  BIGINT  NOT NULL,

    CONSTRAINT pk_achievement_progresses PRIMARY KEY (id),
    CONSTRAINT fk_achievement_progresses_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_achievement_progresses_achievement FOREIGN KEY (achievement_id)
        REFERENCES achievements (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uk_achievement_progresses_user_and_achievement UNIQUE (user_id, achievement_id)
);
