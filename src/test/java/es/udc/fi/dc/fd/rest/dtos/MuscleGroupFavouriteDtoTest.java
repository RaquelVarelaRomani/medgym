package es.udc.fi.dc.fd.rest.dtos;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class MuscleGroupFavouriteDtoTest {

    @Test
    void testDefaultConstructor() {
        MuscleGroupFavouriteDto dto = new MuscleGroupFavouriteDto();
        assertNotNull(dto);
        assertNull(dto.getMuscleGroup());
    }

    @Test
    void testParameterizedConstructor() {
        String muscleGroup = "LEG";
        MuscleGroupFavouriteDto dto = new MuscleGroupFavouriteDto(muscleGroup);

        assertNotNull(dto);
        assertEquals(muscleGroup, dto.getMuscleGroup());
    }

    @Test
    void testGetterAndSetter() {
        MuscleGroupFavouriteDto dto = new MuscleGroupFavouriteDto();
        String muscleGroup = "CHEST";

        dto.setMuscleGroup(muscleGroup);
        assertEquals(muscleGroup, dto.getMuscleGroup());
    }

    @Test
    void testSetMuscleGroupToNull() {
        MuscleGroupFavouriteDto dto = new MuscleGroupFavouriteDto("BACK");
        dto.setMuscleGroup(null);
        assertNull(dto.getMuscleGroup());
    }
}
