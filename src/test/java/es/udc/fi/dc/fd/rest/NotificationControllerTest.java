package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Notification.NotificationType;
import es.udc.fi.dc.fd.model.entities.Routine.DifficultyType;
import es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.User.StatusType;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserFollowDao userFollowDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private User client;
    private User trainer;
    private Routine routine;
    private Workout workout;

    @BeforeEach
    void setup() {
        client = new User("Client", "Surname", "client@email.com", "+34 000 000 000", "password", RoleType.CLIENT, StatusType.ACTIVE);
        client.setPassword(passwordEncoder.encode(client.getPassword()));
        userDao.save(client);

        trainer = new User("Trainer", "Surname", "trainer@email.com", "+34 000 000 001", "password", RoleType.TRAINER, StatusType.ACTIVE);
        trainer.setPassword(passwordEncoder.encode(trainer.getPassword()));
        userDao.save(trainer);

        routine = new Routine("Routine Test", "Description", VisibilityType.PUBLIC, DifficultyType.BEGINNER, trainer);
        routineDao.save(routine);

        UserFollow follow = new UserFollow(client, trainer);
        userFollowDao.save(follow);

        workout = new Workout(LocalDateTime.now(), LocalDateTime.now().plusHours(1), routine, trainer);
        workoutDao.save(workout);
    }

    @Test
    void testCreateNewRoutineNotification() throws Exception {
        mockMvc.perform(post("/api/notifications/newRoutine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"routineId\":" + routine.getId() + "}")
                        .requestAttr("userId", trainer.getId()))
                .andExpect(status().isOk());

        List<Notification> notifications = notificationDao.findByUserIdOrderByDateDesc(client.getId());
        assertEquals(1, notifications.size());
        assertEquals("Nueva rutina: " + routine.getName(), notifications.get(0).getMessage());
        assertEquals(NotificationType.NEW_ROUTINE, notifications.get(0).getType());
    }

    @Test
    void testCreateFollowNotification() throws Exception {
        String json = """
                {
                  "clientId": %d,
                  "trainerId": %d
                }
                """.formatted(client.getId(), trainer.getId());

        mockMvc.perform(post("/api/notifications/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        List<Notification> notifications = notificationDao.findByUserIdOrderByDateDesc(trainer.getId());
        assertEquals(1, notifications.size());
        assertTrue(notifications.get(0).getMessage().contains(client.getName()));
        assertEquals(NotificationType.FOLLOW, notifications.get(0).getType());
    }

    @Test
    void testCreateRoutineLikeNotification() throws Exception {
        String json = """
                {
                  "clientId": %d,
                  "trainerId": %d,
                  "routineId": %d
                }
                """.formatted(client.getId(), trainer.getId(), routine.getId());

        mockMvc.perform(post("/api/notifications/routineLike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        List<Notification> notifications = notificationDao.findByUserIdOrderByDateDesc(trainer.getId());
        assertEquals(1, notifications.size());
        assertTrue(notifications.get(0).getMessage().contains(client.getName()));
        assertTrue(notifications.get(0).getMessage().contains(routine.getName()));
        assertEquals(NotificationType.ROUTINE_LIKE, notifications.get(0).getType());
    }

    @Test
    void testGetUserNotifications() throws Exception {
        Notification notification = new Notification("Mensaje", NotificationType.NEW_ROUTINE, 1L, client, false, LocalDateTime.now());
        notificationDao.save(notification);

        mockMvc.perform(get("/api/notifications")
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("Mensaje"));
    }

    @Test
    void testMarkNotificationAsRead() throws Exception {
        Notification notification = new Notification("Test", NotificationType.FOLLOW, 1L, client, false, LocalDateTime.now());
        notificationDao.save(notification);

        mockMvc.perform(put("/api/notifications/" + notification.getId() + "/read")
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        Notification updated = notificationDao.findById(notification.getId()).orElseThrow();
        assertTrue(updated.getIsRead());
    }

    @Test
    void testDeleteNotification() throws Exception {
        Notification notification = new Notification("Test", NotificationType.FOLLOW, 1L, client, false, LocalDateTime.now());
        notificationDao.save(notification);

        mockMvc.perform(delete("/api/notifications/" + notification.getId())
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        assertTrue(notificationDao.findById(notification.getId()).isEmpty());
    }

    @Test
    void testCreateWorkoutLikeNotification() throws Exception {
        String json = """
                {
                  "userId": %d,
                  "workoutId": %d
                }
                """.formatted(client.getId(), workout.getId());

        mockMvc.perform(post("/api/notifications/workoutLike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        List<Notification> notifications = notificationDao.findByUserIdOrderByDateDesc(trainer.getId());
        assertEquals(1, notifications.size());
        assertTrue(notifications.get(0).getMessage().contains(client.getName()));
        assertTrue(notifications.get(0).getMessage().contains(routine.getName()));
        assertEquals(NotificationType.WORKOUT_LIKE, notifications.get(0).getType());
    }

}
