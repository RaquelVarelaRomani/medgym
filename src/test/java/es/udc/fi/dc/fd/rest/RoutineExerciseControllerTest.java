package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.RoutineExerciseService;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.RoutineExerciseController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseDto;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineExerciseControllerTest {
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
    private UserController userController;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private RoutineExerciseController routineExerciseController;

    @Autowired
    private RoutineExerciseService routineExerciseService;

    private Exercise createExercise(String name){
        Exercise exercise = new Exercise(name, name + " description");
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, name + " description", user);
        return routineDao.save(routine);
    }

    private User createUser(String email, User.RoleType roleType){
        User user = new User("user", "1", email, "+34 000 000 000", "password");

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(roleType);

        return userDao.save(user);
    }

    private AuthenticatedUserDto loginUser(User user)
            throws IncorrectLoginException {
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword("password");

        return userController.login(loginParams);
    }


    @Test
    public void testAddAndDeleteExerciseToRoutine() throws Exception {
        User trainer = createUser("trainer", User.RoleType.TRAINER);
        AuthenticatedUserDto authUser = loginUser(trainer);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto(null, routine.getId(), exercise.getId(), "Description");

        mockMvc.perform(post("/api/routine/" + routine.getId()+ "/exercise/")
                        .header("Authorization", "Bearer " + authUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsBytes(dto)))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetExercisesForRoutinesPaging() throws Exception {
        User trainer = createUser("trainer", User.RoleType.TRAINER);
        AuthenticatedUserDto authUser = loginUser(trainer);
        Routine routine = createRoutine("Rutina", trainer);
        Exercise exercise1 = createExercise("Ejercicio 1");
        Exercise exercise2 = createExercise("Ejercicio 2");
        Exercise exercise3 = createExercise("Ejercicio 3");

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise1.getId(), routine.getId(), "Description 1");
        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise2.getId(), routine.getId(), "Description 2");
        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise3.getId(), routine.getId(), "Description 3");

        mockMvc.perform(get("/api/routine/" + routine.getId() + "exercise/")
                        .header("Authorization", "Bearer " + authUser.getServiceToken())
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/api/routine/" + routine.getId() + "exercise/")
                        .header("Authorization", "Bearer " + authUser.getServiceToken())
                        .param("page", "1")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    public void testAddExerciseToRoutinePermissionDenied() throws Exception {
        User user = createUser("user", User.RoleType.CLIENT);
        AuthenticatedUserDto authUser = loginUser(user);
        Exercise exercise = createExercise("Ejercicio.");
        Routine routine = createRoutine("Rutina", user);

        RoutineExerciseDto dto = new RoutineExerciseDto(null, routine.getId(), exercise.getId(), "Description");

        mockMvc.perform(post("/api/routine/" + routine.getId() + "/exercise/")
                        .header("Authorization", "Bearer " + authUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsBytes(dto)))
                .andExpect(status().isForbidden());
    }
}
