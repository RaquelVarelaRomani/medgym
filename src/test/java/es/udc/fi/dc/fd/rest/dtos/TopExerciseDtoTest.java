package es.udc.fi.dc.fd.rest.dtos;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class TopExerciseDtoTest {

    @Test
    void testDefaultConstructor() {
        TopExerciseDto dto = new TopExerciseDto();
        assertNotNull(dto);
        assertNull(dto.getCount());
        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    void testGetterAndSetter() {
        TopExerciseDto dto = new TopExerciseDto();
        Long count = 42L;

        dto.setCount(count);
        assertEquals(count, dto.getCount());
    }

    @Test
    void testInheritanceFromExerciseDto() {
        TopExerciseDto dto = new TopExerciseDto();

        dto.setId(1L);
        dto.setName("Bench Press");
        dto.setDescription("Chest exercise");
        dto.setMuscleGroup("CHEST");
        dto.setEquipment("BARBELL");
        dto.setStatus("APPROVED");
        dto.setCreatorId(100L);
        dto.setCount(25L);

        assertEquals(1L, dto.getId());
        assertEquals("Bench Press", dto.getName());
        assertEquals("Chest exercise", dto.getDescription());
        assertEquals("CHEST", dto.getMuscleGroup());
        assertEquals("BARBELL", dto.getEquipment());
        assertEquals("APPROVED", dto.getStatus());
        assertEquals(100L, dto.getCreatorId());
        assertEquals(25L, dto.getCount());
    }

    @Test
    void testSetCountToZero() {
        TopExerciseDto dto = new TopExerciseDto();
        dto.setCount(0L);
        assertEquals(0L, dto.getCount());
    }

    @Test
    void testSetCountToNull() {
        TopExerciseDto dto = new TopExerciseDto();
        dto.setCount(100L);
        dto.setCount(null);
        assertNull(dto.getCount());
    }
}
