package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import es.udc.fi.dc.fd.model.entities.Notification.NotificationType;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private RoutineService routineService;

    @MockBean
    private UserService userService;

    private User client;
    private User trainer;
    private Routine routine;

    @BeforeEach
    public void setup() {
        client = new User();
        client.setId(1L);
        client.setName("Client");

        trainer = new User();
        trainer.setId(2L);
        trainer.setName("Trainer");

        routine = new Routine();
        routine.setId(10L);
        routine.setName("Routine Test");
    }

    @Test
    public void testCreateNewRoutineNotification() throws Exception {
        Mockito.when(routineService.findRoutineById(10L)).thenReturn(routine);

        mockMvc.perform(post("/api/notifications/newRoutine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"routineId\":10}")
                        .requestAttr("userId", trainer.getId()))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).createNewRoutineNotification(eq(routine.getId()));
    }

    @Test
    public void testCreateFollowNotification() throws Exception {
        Mockito.when(userService.findUserById(1L)).thenReturn(client);
        Mockito.when(userService.findUserById(2L)).thenReturn(trainer);

        String json = """
        {
          "clientId": 1,
          "trainerId": 2
        }
        """;

        mockMvc.perform(post("/api/notifications/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).createFollowNotification(client.getId(), trainer.getId());
    }

    @Test
    public void testCreateRoutineLikeNotification() throws Exception {
        Mockito.when(userService.findUserById(1L)).thenReturn(client);
        Mockito.when(userService.findUserById(2L)).thenReturn(trainer);
        Mockito.when(routineService.findRoutineById(10L)).thenReturn(routine);

        String json = """
        {
          "clientId": 1,
          "trainerId": 2,
          "routineId": 10
        }
        """;

        mockMvc.perform(post("/api/notifications/routineLike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", client.getId()))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).createRoutineLikeNotification(client.getId(), routine.getId());
    }

    @Test
    public void testGetUserNotifications() throws Exception {
        User user = new User();
        user.setId(1L);

        es.udc.fi.dc.fd.model.entities.Notification notification =
                new Notification("Mensaje", NotificationType.NEW_ROUTINE, 1L, user, false, java.time.LocalDateTime.now());
        notification.setId(5L);

        Mockito.when(notificationService.getNotificationsByUser(1L))
                .thenReturn(List.of(notification));

        mockMvc.perform(get("/api/notifications")
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("Mensaje"));
    }

    @Test
    public void testMarkNotificationAsRead() throws Exception {
        mockMvc.perform(put("/api/notifications/99/read")
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).markNotificationAsRead(99L);
    }

    @Test
    public void testDeleteNotification() throws Exception {
        mockMvc.perform(delete("/api/notifications/88")
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).deleteNotification(88L);
    }

    @Test
    public void testCreateWorkoutLikeNotification() throws Exception {
        String json = """
    {
      "userId": 1,
      "workoutId": 20
    }
    """;

        mockMvc.perform(post("/api/notifications/workoutLike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .requestAttr("userId", 1L))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).createWorkoutLikeNotification(1L, 20L);
    }

}
