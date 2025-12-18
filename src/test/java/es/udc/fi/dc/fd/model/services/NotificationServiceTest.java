package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.User.StatusType;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import org.springframework.boot.test.mock.mockito.MockBean;
import java.time.*;
import static org.mockito.Mockito.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NotificationServiceTest {

        @Autowired
        private NotificationService notificationService;

        @Autowired
        private RoutineService routineService;

        @Autowired
        private UserFollowService userFollowService;

        @Autowired
        private UserDao userDao;

        @Autowired
        private WorkoutService workoutService;

        @Autowired
        private WorkoutExerciseDao workoutExerciseDao;

        @Autowired
        private RoutineExerciseDao routineExerciseDao;

        @Autowired
        private ExerciseDao exerciseDao;

        @MockBean
        private Clock clock;

        @Autowired
        private NotificationDao notificationDao;

    @Test
    void testCreateNewRoutineNotification() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User client = userDao.save(new User("clientA", "clientA", "clientA@test.com",
                "600000001", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerA", "trainerA", "trainerA@test.com",
                "600000002", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        userFollowService.followUser(client.getId(), trainer.getId());

        Routine routine = routineService.createRoutine("routineA", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        List<Notification> notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("Nueva rutina: routineA"));
        assertEquals(Notification.NotificationType.NEW_ROUTINE, n.getType());
        assertEquals(routine.getId(), n.getIdToRedirect());
    }

    @Test
    void testCreateFollowNotification() throws InstanceNotFoundException {
        User client = userDao.save(new User("clientB", "clientB", "clientB@test.com",
                "600000003", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerB", "trainerB", "trainerB@test.com",
                "600000004", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        notificationService.createFollowNotification(client.getId(), trainer.getId());

        List<Notification> notifications = notificationService.getNotificationsByUser(trainer.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("ha comenzado a seguirte"));
        assertEquals(Notification.NotificationType.FOLLOW, n.getType());
        assertEquals(client.getId(), n.getIdToRedirect());
    }

    @Test
    void testCreateRoutineLikeNotification() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User client = userDao.save(new User("clientC", "clientC", "clientC@test.com",
                "600000005", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerC", "trainerC", "trainerC@test.com",
                "600000006", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        Routine routine = routineService.createRoutine(
                "LikeRoutine", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        notificationService.createRoutineLikeNotification(client.getId(), routine.getId());

        List<Notification> notifications = notificationService.getNotificationsByUser(trainer.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("ha dado like"));
        assertTrue(n.getMessage().contains("LikeRoutine"));
        assertEquals(Notification.NotificationType.ROUTINE_LIKE, n.getType());
        assertEquals(routine.getId(), n.getIdToRedirect());
    }

    @Test
    void testMarkNotificationAsRead() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User client = userDao.save(new User("clientD", "clientD", "clientD@test.com",
                "600000007", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerD", "trainerD", "trainerD@test.com",
                "600000008", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        userFollowService.followUser(client.getId(), trainer.getId());
        routineService.createRoutine("routineD", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());
        var notification = notifications.get(0);
        assertFalse(notification.getIsRead());

        notificationService.markNotificationAsRead(notification.getId());

        var updated = notificationService.getNotificationsByUser(client.getId()).get(0);
        assertTrue(updated.getIsRead());
    }

    @Test
    void testDeleteNotification() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User client = userDao.save(new User("clientE", "clientE", "clientE@test.com",
                "600000009", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerE", "trainerE", "trainerE@test.com",
                "600000010", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        userFollowService.followUser(client.getId(), trainer.getId());
        routineService.createRoutine("routineE", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        var id = notifications.get(0).getId();
        notificationService.deleteNotification(id);

        assertTrue(notificationService.getNotificationsByUser(client.getId()).isEmpty());
    }

    @Test
    void testCreateWorkoutLikeNotification() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User u1 = userDao.save(new User("u1", "u1", "u1@test.com", "600000011", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User u2 = userDao.save(new User("u2", "u2", "u2@test.com", "600000012", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        u2.setTrainerPremium(true);

        Routine r = routineService.createRoutine("R1", "d", u2,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        var w = workoutService.startWorkout(r.getId(), u2.getId());

        notificationService.createWorkoutLikeNotification(u1.getId(), w.getId());

        var list = notificationService.getNotificationsByUser(u2.getId());
        assertEquals(1, list.size());
        assertEquals(Notification.NotificationType.WORKOUT_LIKE, list.get(0).getType());
        assertEquals(w.getId(), list.get(0).getIdToRedirect());
    }

    @Test
    void testCreateWorkoutCommentNotification() throws Exception {
        User u1 = userDao.save(new User("u1c", "u1c", "u1c@test.com", "600000013", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User u2 = userDao.save(new User("u2c", "u2c", "u2c@test.com", "600000014", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        u2.setTrainerPremium(true);

        Routine r = routineService.createRoutine("R2", "d", u2,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        var w = workoutService.startWorkout(r.getId(), u2.getId());

        notificationService.createWorkoutCommentNotification(u1.getId(), "msg", w.getId());

        var list = notificationService.getNotificationsByUser(u2.getId());
        assertEquals(1, list.size());
        assertEquals(Notification.NotificationType.WORKOUT_COMMENT, list.get(0).getType());
        assertEquals(w.getId(), list.get(0).getIdToRedirect());
    }

        @Test
        void testDeleteNotificationsByIdToRedirect() throws Exception {
                User u = userDao.save(new User("uX", "uX", "uX@test.com", "600000015", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
                User t = userDao.save(new User("tX", "tX", "tX@test.com", "600000016", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
                t.setTrainerPremium(true);

                userFollowService.followUser(u.getId(), t.getId());
                Routine r = routineService.createRoutine("R3", "d", t,
                        Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

                notificationService.deleteNotificationsByIdToRedirect(r.getId());

                assertTrue(notificationService.getNotificationsByUser(u.getId()).isEmpty());
        }

        @Test
        void testCreateDailyWrappedReminders_beforeDec22_doesNothing() {
        // 21/12/2025
        LocalDate day = LocalDate.of(2025, 12, 21);
        setClock(day);

        long before = notificationDao.count();

        notificationService.createDailyWrappedReminders();

        long after = notificationDao.count();

        assertEquals(before, after, "Antes del 22 de diciembre no debería crearse ninguna notificación Wrapped");
        }

        @Test
        void testCreateDailyWrappedReminders_onDec22_createsWrappedForAllUsers() {
        // 22/12/2025
        LocalDate day = LocalDate.of(2025, 12, 22);
        setClock(day);

        // Creamos 2 usuarios de test (no dependemos de data.sql)
        User u1 = userDao.save(new User("wrap1", "wrap1", "wrap1@test.com",
                "699000001", "pass", RoleType.CLIENT, StatusType.ACTIVE));
        User u2 = userDao.save(new User("wrap2", "wrap2", "wrap2@test.com",
                "699000002", "pass", RoleType.CLIENT, StatusType.ACTIVE));

        notificationService.createDailyWrappedReminders();

        assertTrue(hasWrappedFor(u1.getId(), day, 2025L));
        assertTrue(hasWrappedFor(u2.getId(), day, 2025L));
        }

        @Test
        void testCreateDailyWrappedReminders_idempotent_sameDay_noDuplicates() {
        LocalDate day = LocalDate.of(2025, 12, 22);
        setClock(day);

        User u = userDao.save(new User("wrap3", "wrap3", "wrap3@test.com",
                "699000003", "pass", RoleType.CLIENT, StatusType.ACTIVE));

        notificationService.createDailyWrappedReminders();
        notificationService.createDailyWrappedReminders(); // misma fecha, no debe duplicar

        long count = notificationDao.findByUserIdOrderByDateDesc(u.getId()).stream()
                .filter(n -> n.getType() == Notification.NotificationType.WRAPPED_REMINDER)
                .filter(n -> day.equals(n.getTargetDate()))
                .filter(n -> Long.valueOf(2025L).equals(n.getIdToRedirect()))
                .count();

        assertEquals(1, count, "No debe haber duplicados de Wrapped el mismo día para el mismo usuario");
        }

        private void setClock(LocalDate date) {
                ZoneId zone = ZoneId.of("Europe/Madrid");
                Instant instant = date.atStartOfDay(zone).toInstant();
                when(clock.getZone()).thenReturn(zone);
                when(clock.instant()).thenReturn(instant);
        }

        private boolean hasWrappedFor(Long userId, LocalDate day, Long year) {
        return notificationDao.findByUserIdOrderByDateDesc(userId).stream()
                .anyMatch(n ->
                        n.getType() == Notification.NotificationType.WRAPPED_REMINDER
                                && day.equals(n.getTargetDate())
                                && year.equals(n.getIdToRedirect())
                );
        }


}
