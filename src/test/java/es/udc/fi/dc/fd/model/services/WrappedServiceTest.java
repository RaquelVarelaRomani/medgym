package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@ExtendWith(MockitoExtension.class)
public class WrappedServiceTest {

    @Autowired
    private WrappedService wrappedService;

    @MockBean
    private WorkoutDao workoutDao;

    @MockBean
    private WorkoutExerciseDao workoutExerciseDao;

    @MockBean
    private ExerciseDao exerciseDao;

    @Test
    public void testGetTopExercisesByUser() {
        Long userId = 2L; // Laura
        List<Exercise> topExercises = wrappedService.getTopExercisesByUser(userId);

        assertEquals(5, topExercises.size());

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
