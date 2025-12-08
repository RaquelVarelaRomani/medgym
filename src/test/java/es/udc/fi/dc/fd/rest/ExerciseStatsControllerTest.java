package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExerciseStatsControllerTest {

    private static final String PASSWORD = "password";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    @Autowired private UserDao userDao;
    @Autowired private ExerciseDao exerciseDao;
    @Autowired private WorkoutDao workoutDao;
    @Autowired private WorkoutExerciseDao workoutExerciseDao;
    @Autowired private RoutineExerciseDao routineExerciseDao;
    @Autowired private UserController userController;

    private AuthenticatedUserDto user;

    @BeforeEach
    void setUp() throws IncorrectLoginException, BlockedUserException {
        user = createAuthenticatedUser(
                "Test", "User", "test@test.com", "600000001",
                RoleType.CLIENT, null
        );
    }

    private AuthenticatedUserDto createAuthenticatedUser(
            String name, String surname, String email, String phone,
            RoleType roleType, Boolean premium)
            throws IncorrectLoginException, BlockedUserException {

        User u = new User(name, surname, email, phone, PASSWORD, null, User.StatusType.ACTIVE);
        u.setPassword(passwordEncoder.encode(PASSWORD));
        u.setRole(roleType);
        u.setTrainerPremium(premium);
        userDao.save(u);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(u.getEmail());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);
    }

    @Test
    void testGetExerciseStatsReturnsData() throws Exception {

        // Crear ejercicio
        Exercise exercise = new Exercise(
                "Bench Press",
                "Chest exercise",
                Exercise.MuscleGroup.CHEST,
                Exercise.Equipment.BARBELL,
                null,
                Exercise.ExerciseStatus.APPROVED,
                null
        );
        exerciseDao.save(exercise);

        // Crear RoutineExercise necesario
        RoutineExercise routineExercise = new RoutineExercise();
        routineExercise.setExercise(exercise);
        routineExerciseDao.save(routineExercise);

        // Recuperar User real
        User dbUser = userDao.findById(user.getUserDto().getId()).orElseThrow();

        // Workouts
        Workout w1 = new Workout(
                LocalDate.now().minusDays(2).atStartOfDay(),
                LocalDate.now().minusDays(2).atTime(1, 0),
                null,
                dbUser
        );
        workoutDao.save(w1);

        Workout w2 = new Workout(
                LocalDate.now().minusDays(1).atStartOfDay(),
                LocalDate.now().minusDays(1).atTime(1, 0),
                null,
                dbUser
        );
        workoutDao.save(w2);

        // WorkoutExercise con RoutineExercise asociado ✔️
        workoutExerciseDao.save(new WorkoutExercise((short) 8, (short) 40, null, w1, routineExercise));

        workoutExerciseDao.save(new WorkoutExercise((short) 6, (short) 50, null, w2, routineExercise));

        mockMvc.perform(get("/api/stats/exercise/" + exercise.getId())
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value(40))
                .andExpect(jsonPath("$[1].value").value(50));
    }
}
