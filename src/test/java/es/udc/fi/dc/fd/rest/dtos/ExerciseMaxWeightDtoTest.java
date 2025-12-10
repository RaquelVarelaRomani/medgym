package es.udc.fi.dc.fd.rest.dtos;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExerciseMaxWeightDtoTest {

    @Test
    void testConstructorAndGetters() {

        Long id = 10L;
        Long userId = 5L;
        String userName = "Carlos";
        String userSurname = "Gómez";
        byte[] picture = new byte[]{1, 2, 3};
        Short maxWeight = 120;

        ExerciseMaxWeightDto dto =
                new ExerciseMaxWeightDto(id, userId, userName, userSurname, picture, maxWeight);

        assertEquals(id, dto.getId());
        assertEquals(userId, dto.getUserId());
        assertEquals(userName, dto.getUserName());
        assertEquals(userSurname, dto.getUserSurname());
        assertArrayEquals(picture, dto.getUserProfilePicture());
        assertEquals(maxWeight, dto.getMaxWeightKg());
    }

    @Test
    void testSetters() {

        ExerciseMaxWeightDto dto = new ExerciseMaxWeightDto();

        dto.setId(7L);
        dto.setUserId(3L);
        dto.setUserName("Laura");
        dto.setUserSurname("Fernández");
        dto.setUserProfilePicture(new byte[]{9, 9});
        dto.setMaxWeightKg((short) 85);

        assertEquals(7L, dto.getId());
        assertEquals(3L, dto.getUserId());
        assertEquals("Laura", dto.getUserName());
        assertEquals("Fernández", dto.getUserSurname());
        assertArrayEquals(new byte[]{9, 9}, dto.getUserProfilePicture());
        assertEquals((short) 85, dto.getMaxWeightKg());
    }
}
