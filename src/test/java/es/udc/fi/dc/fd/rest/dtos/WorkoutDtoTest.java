package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


class WorkoutDtoTest {

    @Test
    void testToWorkoutDto() {
        User user = new User("John", "Doe", "john@test.com", "+34 123 456 789", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Routine routine = new Routine("Test Routine", "Description", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusHours(1);

        Workout workout = new Workout(start, end, routine, user);
        workout.setId(3L);

        WorkoutDto dto = WorkoutConversor.toWorkoutDto(workout);

        assertNotNull(dto);
        assertEquals(workout.getId(), dto.getId());
        assertEquals(workout.getStartTime(), dto.getStartTime());
        assertEquals(workout.getEndTime(), dto.getEndTime());
        assertEquals(routine.getId(), dto.getRoutineId());
        assertEquals(routine.getName(), dto.getRoutineName());
        assertEquals(user.getId(), dto.getUserId());
    }

    @Test
    void testToWorkoutForFeedDto() {
        User user = new User("Jane", "Smith", "jane@test.com", "+34 987 654 321", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);
        user.setProfilePicture(new byte[]{1, 2, 3});

        Routine routine = new Routine("Feed Routine", "Desc", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusMinutes(30);

        Workout workout = new Workout(start, end, routine, user);
        workout.setId(3L);

        WorkoutComment comment = new WorkoutComment("Nice workout", LocalDateTime.now(), workout, user);
        WorkoutLike like = new WorkoutLike(workout, user);

        workout.setComments(List.of(comment));
        workout.setLikes(List.of(like));

        WorkoutForFeedDto dto = WorkoutConversor.toWorkoutForFeedDto(workout);

        assertNotNull(dto);
        assertEquals(workout.getId(), dto.getId());
        assertEquals(user.getName(), dto.getUserName());
        assertEquals(user.getSurname(), dto.getUserSurname());
        assertEquals(user.getProfilePicture(), dto.getUserProfilePicture());
        assertNotNull(dto.getComments());
        assertNotNull(dto.getLikes());
    }

    @Test
    void testToWorkoutForHistoryDto() {
        User user = new User("History", "User", "history@test.com", "+34 111 222 333", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Routine routine = new Routine("History Routine", "Desc", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        Workout workout = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(2), routine, user);
        workout.setId(3L);

        WorkoutForHistoryDto dto = WorkoutConversor.toWorkoutForHistoryDto(workout);

        assertNotNull(dto);
        assertEquals(workout.getId(), dto.getId());
        assertEquals(routine.getId(), dto.getRoutineId());
        assertEquals(user.getId(), dto.getUserId());
    }

    @Test
    void testToWorkoutDtos() {
        User user = new User("List", "User", "list@test.com", "+34 444 555 666", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Routine routine = new Routine("List Routine", "Desc", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        Workout workout1 = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(1), routine, user);
        workout1.setId(3L);

        Workout workout2 = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(1), routine, user);
        workout2.setId(4L);

        List<Workout> workouts = Arrays.asList(workout1, workout2);

        List<WorkoutDto> dtos = WorkoutConversor.toWorkoutDtos(workouts);

        assertNotNull(dtos);
        assertEquals(2, dtos.size());
        assertEquals(workout1.getId(), dtos.get(0).getId());
        assertEquals(workout2.getId(), dtos.get(1).getId());
    }

    @Test
    void testToWorkoutForFeedDtos() {
        User user = new User("FeedList", "User", "feedlist@test.com", "+34 777 888 999", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Routine routine = new Routine("FeedList Routine", "Desc", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        Workout workout = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(1), routine, user);
        workout.setId(3L);

        List<Workout> workouts = List.of(workout);

        List<WorkoutForFeedDto> dtos = WorkoutConversor.toWorkoutForFeedDtos(workouts);

        assertNotNull(dtos);
        assertEquals(1, dtos.size());
    }

    @Test
    void testToWorkoutForHistoryDtos() {
        User user = new User("HistoryList", "User", "historylist@test.com", "+34 000 111 222", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Routine routine = new Routine("HistoryList Routine", "Desc", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setId(2L);

        Workout workout = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(1), routine, user);
        workout.setId(3L);

        List<Workout> workouts = List.of(workout);

        List<WorkoutForHistoryDto> dtos = WorkoutConversor.toWorkoutForHistoryDtos(workouts);

        assertNotNull(dtos);
        assertEquals(1, dtos.size());
    }
}