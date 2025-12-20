package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineLike;
import es.udc.fi.dc.fd.model.entities.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class FavouriteRoutineConversorTest {

    @Test
    void testToFavouriteRoutineDtoWithNullRoutine() {
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(null, 10L);
        assertNull(dto);
    }

    @Test
    void testToFavouriteRoutineDtoWithValidRoutine() {
        User trainer = new User("John", "Doe", "john@test.com", "+34 123 456 789",
                "password", User.RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setId(1L);

        LocalDateTime creationDate = LocalDateTime.of(2024, 1, 15, 10, 0);
        LocalDateTime modificationDate = LocalDateTime.of(2024, 2, 20, 14, 30);

        Routine routine = new Routine("Morning Routine", "A great morning workout",
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routine.setId(10L);
        routine.setCreationDate(creationDate);
        routine.setModificationDate(modificationDate);

        User liker = new User("Jane", "Smith", "jane@test.com", "+34 987 654 321",
                "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        liker.setId(2L);

        RoutineLike routineLike = new RoutineLike(liker, routine);
        List<RoutineLike> likes = List.of(routineLike);
        routine.setRoutineLikes(likes);

        Long count = 25L;
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(routine, count);

        assertNotNull(dto);
        assertEquals(routine.getId(), dto.getId());
        assertEquals(routine.getName(), dto.getName());
        assertEquals(routine.getDescription(), dto.getDescription());
        assertEquals(routine.getCreationDate(), dto.getCreationDate());
        assertEquals(routine.getModificationDate(), dto.getModificationDate());
        assertEquals(trainer.getId(), dto.getTrainerId());
        assertEquals(trainer.getName(), dto.getTrainerName());
        assertEquals(trainer.getSurname(), dto.getTrainerSurname());
        assertEquals(routine.getVisibility().toString(), dto.getVisibility());
        assertEquals(routine.getDifficulty().toString(), dto.getDifficulty());
        assertEquals(count, dto.getCount());
        assertNotNull(dto.getLikes());
        assertEquals(1, dto.getLikes().size());
    }

    @Test
    void testToFavouriteRoutineDtoWithNullTrainer() {
        Routine routine = new Routine("Evening Routine", "A relaxing evening workout",
                Routine.VisibilityType.PRIVATE, Routine.DifficultyType.ADVANCED, null);
        routine.setId(20L);

        Long count = 5L;
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(routine, count);

        assertNotNull(dto);
        assertEquals(routine.getId(), dto.getId());
        assertEquals(routine.getName(), dto.getName());
        assertEquals(routine.getDescription(), dto.getDescription());
        assertNull(dto.getTrainerId());
        assertNull(dto.getTrainerName());
        assertNull(dto.getTrainerSurname());
        assertEquals(count, dto.getCount());
    }

    @Test
    void testToFavouriteRoutineDtoWithNullVisibilityAndDifficulty() {
        User trainer = new User("Test", "Trainer", "test@test.com", "+34 111 222 333",
                "password", User.RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setId(3L);

        Routine routine = new Routine("Test Routine", "Testing", null, null, trainer);
        routine.setId(30L);

        Long count = 15L;
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(routine, count);

        assertNotNull(dto);
        assertEquals(routine.getId(), dto.getId());
        assertNull(dto.getVisibility());
        assertNull(dto.getDifficulty());
        assertEquals(count, dto.getCount());
    }

    @Test
    void testToFavouriteRoutineDtoWithNullRoutineLikes() {
        User trainer = new User("Simple", "Trainer", "simple@test.com", "+34 000 111 222",
                "password", User.RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setId(4L);

        Routine routine = new Routine("Simple Routine", "Simple workout",
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.INTERMEDIATE, trainer);
        routine.setId(40L);
        routine.setRoutineLikes(null);

        Long count = 3L;
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(routine, count);

        assertNotNull(dto);
        assertEquals(routine.getId(), dto.getId());
        assertNotNull(dto.getLikes());
        assertEquals(0, dto.getLikes().size());
        assertEquals(count, dto.getCount());
    }

    @Test
    void testToFavouriteRoutineDtoWithEmptyRoutineLikes() {
        User trainer = new User("Empty", "Trainer", "empty@test.com", "+34 333 444 555",
                "password", User.RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setId(5L);

        Routine routine = new Routine("Empty Routine", "No likes",
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routine.setId(50L);
        routine.setRoutineLikes(new ArrayList<>());

        Long count = 1L;
        FavouriteRoutineDto dto = FavouriteRoutineConversor.toFavouriteRoutineDto(routine, count);

        assertNotNull(dto);
        assertEquals(routine.getId(), dto.getId());
        assertNotNull(dto.getLikes());
        assertEquals(0, dto.getLikes().size());
        assertEquals(count, dto.getCount());
    }
}
