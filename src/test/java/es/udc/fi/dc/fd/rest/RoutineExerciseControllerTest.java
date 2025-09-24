package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.controllers.RoutineExerciseController;
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
@Ignore
public class RoutineExerciseControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private RoutineExerciseController routineExerciseController;

    private User createTrainer(){
        User user = new User("Pepe", "Domingo", "pepe@domingo.com",
                "666777222", "contraseñasegura");
        user.setRole(User.RoleType.TRAINER);
        return userDao.save(user);
    }

    private Exercise createExercise(String name){
        Exercise exercise = new Exercise(name, "Ejercicio.");
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, "Rutina",
                LocalDateTime.now().withNano(0), LocalDateTime.now().withNano(0), user);
        return routineDao.save(routine);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(email);
        loginParams.setPassword(password);

        ObjectMapper mapper = new ObjectMapper();

        MvcResult loginResult = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsBytes(loginParams)))
                .andExpect(status().isOk())
                .andReturn();

        String body = loginResult.getResponse().getContentAsString();
        AuthenticatedUserDto authUser = mapper.readValue(body, AuthenticatedUserDto.class);
        return authUser.getServiceToken();
    }


    @Test
    public void testAddExerciseToRoutine() throws Exception {
        User user = createTrainer();
        Exercise exercise = createExercise("Ejercicio.");
        Routine routine = createRoutine("Rutina", user);

        String token = loginAndGetToken(user.getEmail(), user.getPassword());

        RoutineExerciseDto dto = new RoutineExerciseDto(null, routine.getId(), exercise.getId(), (byte) 5, null);

        mockMvc.perform(post("/api/routineexercise/add")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsBytes(dto)))
                .andExpect(status().isOk());
    }

}
