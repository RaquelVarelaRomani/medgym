package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.RoutineExerciseService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseDto;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RoutineExerciseControllerTest {

    private static final String PASSWORD = "password";
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserDao userDao;
    @Autowired
    private ExerciseDao exerciseDao;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private RoutineDao routineDao;
    @Autowired
    private RoutineExerciseService routineExerciseService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserController userController;
    private AuthenticatedUserDto adminUser;
    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    @BeforeEach
    void setUp() throws Exception {
        adminUser = createAuthenticatedUser("Admin", "Admin", "admin1@test.com", "600000003", RoleType.ADMIN);
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(
            String name, String surname, String email, String phone, RoleType role) throws Exception {

        User user = new User(name, surname, email, phone, PASSWORD, RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(email);
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);
    }

    private Exercise createExercise(String name, User user) {
        return exerciseDao.save(new Exercise(
                name, name + " description", MuscleGroup.FULL_BODY,
                Equipment.NONE, new byte[]{1, 2, 3},
                ExerciseStatus.PENDING, user));
    }

    private Routine createRoutine(String name, User user) {
        return routineDao.save(new Routine(
                name, name + " description",
                Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER,
                user
        ));
    }

    @Test
    void testAddExerciseToRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(routine.getId());
        dto.setExerciseId(exercise.getId());
        dto.setExerciseName("");
        dto.setExerciseDescription("");
        dto.setExerciseType("STRENGTH");
        dto.setPosition(1);

        mockMvc.perform(post("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exerciseId").value(exercise.getId()))
                .andExpect(jsonPath("$.routineId").value(routine.getId()))
                .andExpect(jsonPath("$.exerciseName").value(exercise.getName()))
                .andExpect(jsonPath("$.exerciseDescription").value(exercise.getDescription()))
                .andExpect(jsonPath("$.position").value(1));
    }

    @Test
    void testUpdateExerciseInRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(
                trainerUser.getUserDto().getId(), routine.getId(), exercise.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(routine.getId());
        dto.setExerciseId(exercise.getId());
        dto.setExerciseType("STRENGTH");
        dto.setExerciseName("");
        dto.setExerciseDescription("");
        dto.setPosition(2);

        mockMvc.perform(put("/api/routines/" + routine.getId() + "/exercises/" + exercise.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value(2));
    }

    @Test
    void testGetExercisesForRoutinesPaging() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = createRoutine("Rutina", trainer);

        Exercise e1 = createExercise("Ejercicio 1", trainer);
        Exercise e2 = createExercise("Ejercicio 2", trainer);
        Exercise e3 = createExercise("Ejercicio 3", trainer);

        routineExerciseService.addExerciseToRoutine(trainerUser.getUserDto().getId(), routine.getId(), e1.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);
        routineExerciseService.addExerciseToRoutine(trainerUser.getUserDto().getId(), routine.getId(), e2.getId(), RoutineExercise.ExerciseType.STRENGTH, 2);
        routineExerciseService.addExerciseToRoutine(trainerUser.getUserDto().getId(), routine.getId(), e3.getId(), RoutineExercise.ExerciseType.STRENGTH, 3);

        mockMvc.perform(get("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .param("page", "1").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void testDeleteExerciseToRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainerUser.getUserDto().getId(),
                routine.getId(), exercise.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        mockMvc.perform(delete("/api/routines/" + routine.getId() + "/exercises/" + exercise.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testAddExerciseToRoutinePermissionDenied() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio.", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(routine.getId());
        dto.setExerciseId(exercise.getId());
        dto.setExerciseName("ExerciseName");
        dto.setExerciseDescription("ExerciseDescription");
        dto.setExerciseType("STRENGTH");
        dto.setPosition(1);

        mockMvc.perform(post("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteExerciseToRoutinePermissionDenied() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = createRoutine("Rutina", trainer);
        Exercise exercise1 = createExercise("Ejercicio 1", trainer);

        routineExerciseService.addExerciseToRoutine(
                trainerUser.getUserDto().getId(), routine.getId(), exercise1.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        mockMvc.perform(delete("/api/routines/" + routine.getId() + "/exercises/" + exercise1.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAddExerciseToRoutineWithNonExistentExercise() throws Exception {
        Routine routine = createRoutine("Rutina", userDao.findById(trainerUser.getUserDto().getId()).get());

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(routine.getId());
        dto.setExerciseId(-1L);
        dto.setExerciseName("ExerciseName");
        dto.setExerciseDescription("ExerciseDescription");
        dto.setExerciseType("STRENGTH");
        dto.setPosition(1);

        mockMvc.perform(post("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testAddExerciseToNonExistentRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(-1L);
        dto.setExerciseId(exercise.getId());
        dto.setExerciseName("ExerciseName");
        dto.setExerciseDescription("ExerciseDescription");
        dto.setExerciseType("STRENGTH");
        dto.setPosition(1);

        mockMvc.perform(post("/api/routines/-1/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteNonExistentRoutineExercise() throws Exception {
        Routine routine = createRoutine("Rutina", userDao.findById(trainerUser.getUserDto().getId()).get());

        mockMvc.perform(delete("/api/routines/" + routine.getId() + "/exercises/-1")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testAddExerciseToRoutineWithInvalidToken() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = createRoutine("Rutina", trainer);
        Exercise exercise = createExercise("Ejercicio", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setRoutineId(routine.getId());
        dto.setExerciseId(exercise.getId());
        dto.setExerciseName("ExerciseName");
        dto.setExerciseDescription("ExerciseDescription");
        dto.setPosition(1);

        mockMvc.perform(post("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer invalidToken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetRoutineExercisesIncludesAllExerciseData() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();

        Exercise exercise = exerciseDao.save(new Exercise(
                "Ejercicio 1 con barra",
                "Ejercicio de pecho con barra",
                MuscleGroup.CHEST,
                Equipment.BENCH_AND_BARBELL,
                new byte[]{1, 2, 3, 4, 5},
                ExerciseStatus.APPROVED,
                trainer
        ));

        Routine routine = createRoutine("Rutina 1 Pecho", trainer);

        routineExerciseService.addExerciseToRoutine(
                trainerUser.getUserDto().getId(), routine.getId(),
                exercise.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        mockMvc.perform(get("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].exerciseId").value(exercise.getId()))
                .andExpect(jsonPath("$.content[0].exerciseName").value("Ejercicio 1 con barra"))
                .andExpect(jsonPath("$.content[0].exerciseDescription").value("Ejercicio de pecho con barra"))
                .andExpect(jsonPath("$.content[0].muscleGroup").value("CHEST"))
                .andExpect(jsonPath("$.content[0].equipment").value("BENCH_AND_BARBELL"))
                .andExpect(jsonPath("$.content[0].image").isNotEmpty());
    }

    @Test
    void testRoutineExerciseReturnsEmptyStringsWhenOptionalFieldsMissing() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();

        Exercise exercise = exerciseDao.save(new Exercise(
                "Flexiones Test", "Ejercicio de pecho básico",
                MuscleGroup.CHEST, Equipment.NONE,
                null, ExerciseStatus.APPROVED, trainer
        ));

        Routine routine = createRoutine("Rutina simple", trainer);

        routineExerciseService.addExerciseToRoutine(
                trainerUser.getUserDto().getId(), routine.getId(),
                exercise.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        mockMvc.perform(get("/api/routines/" + routine.getId() + "/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].exerciseName").value("Flexiones Test"))
                .andExpect(jsonPath("$.content[0].muscleGroup").value("CHEST"))
                .andExpect(jsonPath("$.content[0].equipment").value("NONE"))
                .andExpect(jsonPath("$.content[0].image").doesNotExist());
    }

    @Test
    void testUpdateExerciseInRoutinePermissionDenied() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(
                trainerUser.getUserDto().getId(), routine.getId(),
                exercise.getId(), RoutineExercise.ExerciseType.STRENGTH, 1);

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setExerciseType("STRENGTH");
        dto.setPosition(2);

        mockMvc.perform(put("/api/routines/" + routine.getId() + "/exercises/" + exercise.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateExerciseInNonExistentRoutine() throws Exception {
        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setExerciseType("STRENGTH");
        dto.setPosition(2);

        mockMvc.perform(put("/api/routines/-1/exercises/999")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateNonExistentExerciseInRoutine() throws Exception {
        Routine routine = createRoutine("Rutina", userDao.findById(trainerUser.getUserDto().getId()).get());

        RoutineExerciseDto dto = new RoutineExerciseDto();
        dto.setExerciseType("STRENGTH");
        dto.setPosition(2);

        mockMvc.perform(put("/api/routines/" + routine.getId() + "/exercises/-123")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetExerciseTypes() throws Exception {
        mockMvc.perform(get("/api/exerciseTypes")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(RoutineExercise.ExerciseType.values().length))
                .andExpect(jsonPath("$[0].name").exists());
    }
}
