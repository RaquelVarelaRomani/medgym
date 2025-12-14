package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WrappedServiceTest {
    @Autowired
    private WrappedService wrappedService;

    @Test
    public void testGetTopExercisesByUser() {
        Long userId = 2L; // Laura
        List<Exercise> topExercises = wrappedService.getTopExercisesByUser(userId);

        assertEquals(topExercises.size(), 5);

        boolean contieneSentadillas = topExercises.stream()
                .anyMatch(e -> e.getName().equals("Sentadillas"));
        assertTrue(contieneSentadillas);
    }

    @Test
    public void testGetFavouriteMuscleGroup() {
        Long userId = 2L; // Laura
        String favMuscleGroup = wrappedService.getFavouriteMuscleGroup(userId);
        assertEquals("LEG", favMuscleGroup);
    }

    @Test
    public void testGetFavouriteRoutine() {
        Long userId = 2L; // Laura
        Routine favRoutine = wrappedService.getFavouriteRoutine(userId);
        assertEquals("Rutina fuerza inicial", favRoutine.getName());
    }
}
