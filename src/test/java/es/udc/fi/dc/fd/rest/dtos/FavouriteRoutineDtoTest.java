package es.udc.fi.dc.fd.rest.dtos;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class FavouriteRoutineDtoTest {

    @Test
    void testDefaultConstructor() {
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        assertNotNull(dto);
        assertNull(dto.getCount());
        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    void testGetterAndSetter() {
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        Long count = 15L;

        dto.setCount(count);
        assertEquals(count, dto.getCount());
    }

    @Test
    void testInheritanceFromRoutineDto() {
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        LocalDateTime now = LocalDateTime.now();
        List<RoutineLikeDto> likes = new ArrayList<>();

        dto.setId(1L);
        dto.setName("Morning Routine");
        dto.setDescription("A great morning workout");
        dto.setCreationDate(now);
        dto.setModificationDate(now);
        dto.setTrainerId(5L);
        dto.setTrainerName("John");
        dto.setTrainerSurname("Doe");
        dto.setVisibility("PUBLIC");
        dto.setDifficulty("BEGINNER");
        dto.setLikes(likes);
        dto.setCount(10L);

        assertEquals(1L, dto.getId());
        assertEquals("Morning Routine", dto.getName());
        assertEquals("A great morning workout", dto.getDescription());
        assertEquals(now, dto.getCreationDate());
        assertEquals(now, dto.getModificationDate());
        assertEquals(5L, dto.getTrainerId());
        assertEquals("John", dto.getTrainerName());
        assertEquals("Doe", dto.getTrainerSurname());
        assertEquals("PUBLIC", dto.getVisibility());
        assertEquals("BEGINNER", dto.getDifficulty());
        assertEquals(likes, dto.getLikes());
        assertEquals(10L, dto.getCount());
    }

    @Test
    void testSetCountToZero() {
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        dto.setCount(0L);
        assertEquals(0L, dto.getCount());
    }

    @Test
    void testSetCountToNull() {
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        dto.setCount(50L);
        dto.setCount(null);
        assertNull(dto.getCount());
    }
}
