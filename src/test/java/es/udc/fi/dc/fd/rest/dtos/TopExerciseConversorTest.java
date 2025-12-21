package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TopExerciseConversorTest {

    @Test
    void testToTopExerciseDto() {
        User creator = new User("John", "Doe", "john@test.com", "+34 123 456 789",
                "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        creator.setId(1L);

        Exercise exercise = new Exercise("Bench Press", "Chest exercise",
                Exercise.MuscleGroup.CHEST, Exercise.Equipment.BARBELL,
                new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED, creator);
        exercise.setId(10L);

        Long count = 25L;
        TopExerciseDto dto = TopExerciseConversor.toTopExerciseDto(exercise, count);

        assertNotNull(dto);
        assertEquals(exercise.getId(), dto.getId());
        assertEquals(exercise.getName(), dto.getName());
        assertEquals(exercise.getDescription(), dto.getDescription());
        assertEquals(exercise.getMuscleGroup().toString(), dto.getMuscleGroup());
        assertEquals(exercise.getEquipment().toString(), dto.getEquipment());
        assertEquals(exercise.getImage(), dto.getImage());
        assertEquals(exercise.getStatus().toString(), dto.getStatus());
        assertEquals(creator.getId(), dto.getCreatorId());
        assertEquals(count, dto.getCount());
    }

    @Test
    void testToTopExerciseDtoWithNullCreator() {
        Exercise exercise = new Exercise("Squats", "Leg exercise",
                Exercise.MuscleGroup.LEG, Exercise.Equipment.NONE,
                new byte[]{4, 5, 6}, Exercise.ExerciseStatus.APPROVED, null);
        exercise.setId(20L);

        Long count = 15L;
        TopExerciseDto dto = TopExerciseConversor.toTopExerciseDto(exercise, count);

        assertNotNull(dto);
        assertEquals(exercise.getId(), dto.getId());
        assertEquals(exercise.getName(), dto.getName());
        assertEquals(exercise.getDescription(), dto.getDescription());
        assertEquals(exercise.getMuscleGroup().toString(), dto.getMuscleGroup());
        assertEquals(exercise.getEquipment().toString(), dto.getEquipment());
        assertEquals(exercise.getStatus().toString(), dto.getStatus());
        assertEquals(null, dto.getCreatorId());
        assertEquals(count, dto.getCount());
    }

    @Test
    void testToTopExerciseDtosWithMultipleExercises() {
        User creator = new User("Jane", "Smith", "jane@test.com", "+34 987 654 321",
                "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        creator.setId(2L);

        Exercise exercise1 = new Exercise("Deadlift", "Back exercise",
                Exercise.MuscleGroup.BACK, Exercise.Equipment.BARBELL,
                new byte[]{1, 2}, Exercise.ExerciseStatus.APPROVED, creator);
        exercise1.setId(30L);

        Exercise exercise2 = new Exercise("Shoulder Press", "Shoulder exercise",
                Exercise.MuscleGroup.SHOULDERS, Exercise.Equipment.DUMBBELL,
                new byte[]{3, 4}, Exercise.ExerciseStatus.APPROVED, creator);
        exercise2.setId(40L);

        Map<Exercise, Long> exercisesWithCounts = new HashMap<>();
        exercisesWithCounts.put(exercise1, 50L);
        exercisesWithCounts.put(exercise2, 30L);

        List<TopExerciseDto> dtos = TopExerciseConversor.toTopExerciseDtos(exercisesWithCounts);

        assertNotNull(dtos);
        assertEquals(2, dtos.size());

        assertTrue(dtos.stream().anyMatch(dto -> dto.getId().equals(30L) && dto.getCount().equals(50L)));
        assertTrue(dtos.stream().anyMatch(dto -> dto.getId().equals(40L) && dto.getCount().equals(30L)));
    }

    @Test
    void testToTopExerciseDtosWithEmptyMap() {
        Map<Exercise, Long> exercisesWithCounts = new HashMap<>();
        List<TopExerciseDto> dtos = TopExerciseConversor.toTopExerciseDtos(exercisesWithCounts);

        assertNotNull(dtos);
        assertTrue(dtos.isEmpty());
    }

    @Test
    void testToTopExerciseDtosWithSingleExercise() {
        User creator = new User("Test", "User", "test@test.com", "+34 111 222 333",
                "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        creator.setId(3L);

        Exercise exercise = new Exercise("Pull-ups", "Back exercise",
                Exercise.MuscleGroup.BACK, Exercise.Equipment.NONE,
                new byte[]{7, 8, 9}, Exercise.ExerciseStatus.APPROVED, creator);
        exercise.setId(50L);

        Map<Exercise, Long> exercisesWithCounts = new HashMap<>();
        exercisesWithCounts.put(exercise, 100L);

        List<TopExerciseDto> dtos = TopExerciseConversor.toTopExerciseDtos(exercisesWithCounts);

        assertNotNull(dtos);
        assertEquals(1, dtos.size());
        assertEquals(50L, dtos.get(0).getId());
        assertEquals(100L, dtos.get(0).getCount());
        assertEquals("Pull-ups", dtos.get(0).getName());
    }
}
