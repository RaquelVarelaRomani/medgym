package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.RoutineExerciseController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseDto;
import org.junit.Ignore;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.ContentResultMatchers;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.time.LocalDateTime;

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

    private Exercise createExercise(String name){
        Exercise exercise = new Exercise(name, "Ejercicio.");
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, "Rutina",
                LocalDateTime.now().withNano(0), LocalDateTime.now().withNano(0), user);
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
        Exercise exercise = createExercise("Ejercicio.");
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExerciseDto dto = new RoutineExerciseDto(null, routine.getId(), exercise.getId(), (byte) 5, null);

        mockMvc.perform(post("/api/routineexercise/add")
                        .header("Authorization", "Bearer " + authUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsBytes(dto)))
                .andExpect(status().isOk());
    }

}
