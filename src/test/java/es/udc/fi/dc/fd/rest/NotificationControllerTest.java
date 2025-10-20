package es.udc.fi.dc.fd.rest;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserFollowService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class NotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserController userController;

    @Autowired
    private UserFollowService userFollowService;

    @Autowired
    private NotificationService notificationService;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    private final static String PASSWORD = "password";

    @Before
    public void setUp() throws Exception {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", User.RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws Exception {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, User.RoleType.CLIENT, User.StatusType.ACTIVE);

        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    @Test
    public void testCreateNotification() throws Exception {
        // Preparar datos: crear trainer, client, rutina
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine(
                "Rutina prueba", "Descripción", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        // Construir body del request
        String jsonBody = """
        {
          "routineId": %d
        }
        """.formatted(routine.getId());

        // Ejecutar POST
        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody)
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetNotifications() throws Exception {
        User client = userDao.findById(clientUser.getUserDto().getId()).get();
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("test", "test", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    public void testMarkNotificationAsRead() throws Exception {
        // Preparar trainer y client
        User client = userDao.findById(clientUser.getUserDto().getId()).get();
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        userFollowService.followTrainer(client.getId(), trainer.getId());

        // Crear rutina pública (genera notificación)
        routineService.createRoutine("Rutina lectura", "Desc", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        // Obtener ID de la notificación directamente desde el servicio
        Long notificationId = notificationService
                .getNotificationsByUser(client.getId())
                .get(0)
                .getId();

        // Ejecutar PUT para marcar como leída
        mockMvc.perform(put("/api/notifications/" + notificationId + "/read")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Verificar que ahora está marcada como leída
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isRead").value(true));
    }

    @Test
    public void testDeleteNotification() throws Exception {
        // Preparar trainer y client
        User client = userDao.findById(clientUser.getUserDto().getId()).get();
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();

        // Seguir al trainer y crear una rutina pública (genera notificación)
        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("Rutina eliminar", "Descripción", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        // Obtener ID de la notificación generada
        Long notificationId = notificationService
                .getNotificationsByUser(client.getId())
                .get(0)
                .getId();

        // Confirmar que existe una notificación
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // Ejecutar DELETE
        mockMvc.perform(delete("/api/notifications/" + notificationId)
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());

        // Verificar que ya no hay notificaciones
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

}
