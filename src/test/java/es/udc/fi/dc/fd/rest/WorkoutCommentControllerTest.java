package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import es.udc.fi.dc.fd.model.services.WorkoutCommentService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import org.junit.Before;
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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class WorkoutCommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private WorkoutCommentService workoutCommentService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    private static final String PASSWORD = "password";

    @Before
    public void setUp() throws Exception {
        trainerUser = createAuthenticatedUser("Trainer", "Comment", "trainer_comment@test.com", "600000300", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "Comment", "client_comment@test.com", "600000301", User.RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws Exception {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, roleType, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(email);
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    private Workout createWorkoutFor(User performer) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine(
                "Rutina comentario test", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        return workoutDao.save(new Workout(LocalDateTime.now(), null, routine, performer));
    }

    @Test
    public void testCommentWorkout() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());

        mockMvc.perform(post("/api/workouts/" + workout.getId() + "/comments")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\": \"Comentario test\"}"))
                .andExpect(status().isOk());

        org.junit.Assert.assertEquals(1, workoutCommentService.getWorkoutComments(workout.getId()).size());
    }

    @Test
    public void testGetWorkoutComments() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());
        workoutCommentService.commentWorkout(clientUser.getUserDto().getId(), "Test A", workout.getId());
        workoutCommentService.commentWorkout(clientUser.getUserDto().getId(), "Test B", workout.getId());

        mockMvc.perform(get("/api/workouts/" + workout.getId() + "/comments")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void testDeleteWorkoutComment() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());

        workoutCommentService.commentWorkout(clientUser.getUserDto().getId(), "Borrar", workout.getId());
        Long id = workoutCommentService.getWorkoutComments(workout.getId()).get(0).getId();

        mockMvc.perform(delete("/api/workoutComments/" + id)
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());


        org.junit.Assert.assertTrue(workoutCommentService.getWorkoutComments(workout.getId()).isEmpty());
    }

    @Test
    public void testCommentWorkoutNotFound() throws Exception {
        mockMvc.perform(post("/api/workouts/9999/comments")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\": \"texto\"}"))
                .andExpect(status().isNotFound());
    }
}
