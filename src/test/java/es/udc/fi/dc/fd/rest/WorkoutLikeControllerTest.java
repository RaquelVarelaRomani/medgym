package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import es.udc.fi.dc.fd.model.services.WorkoutLikeService;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class WorkoutLikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private WorkoutLikeService workoutLikeService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    private static final String PASSWORD = "password";

    @Before
    public void setUp() throws Exception {
        trainerUser = createAuthenticatedUser("Trainer", "Test", "trainer_workoutlike@test.com", "600000200", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "WorkoutLike", "client_workoutlike@test.com", "600000201", User.RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws Exception {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, roleType, User.StatusType.ACTIVE);
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
                "Rutina test", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        return workoutDao.save(new Workout(LocalDateTime.now(), null, routine, performer));
    }

    @Test
    public void testLikeWorkout() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());

        mockMvc.perform(post("/api/workouts/" + workout.getId() + "/like")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isOk());

        List<?> likes = workoutLikeService.getLikesByUser(clientUser.getUserDto().getId());
        org.junit.Assert.assertEquals(1, likes.size());
    }

    @Test
    public void testGetWorkoutLikesByUser() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());
        workoutLikeService.likeWorkout(clientUser.getUserDto().getId(), workout.getId());

        mockMvc.perform(get("/api/workoutLikes")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].workoutId").value(workout.getId()));
    }

    @Test
    public void testUnlikeWorkout() throws Exception {
        Workout workout = createWorkoutFor(userDao.findById(clientUser.getUserDto().getId()).get());
        workoutLikeService.likeWorkout(clientUser.getUserDto().getId(), workout.getId());

        mockMvc.perform(delete("/api/workouts/" + workout.getId() + "/unlike")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isOk());

        List<?> likes = workoutLikeService.getLikesByUser(clientUser.getUserDto().getId());
        org.junit.Assert.assertTrue(likes.isEmpty());
    }
}
