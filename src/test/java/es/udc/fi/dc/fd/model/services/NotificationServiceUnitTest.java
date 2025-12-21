package es.udc.fi.dc.fd.model.services;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;

@ExtendWith(MockitoExtension.class)
class NotificationServiceUnitTest {

    @Mock
    private NotificationDao notificationDao;

    @Mock
    private UserDao userDao;

    @Mock
    private Clock clock;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void testCreateDailyWrappedReminders_beforeDec22_doesNothing() {
        LocalDate date = LocalDate.of(2025, 12, 21);
        setClock(date);

        notificationService.createDailyWrappedReminders();

        verify(userDao, never()).findAll();
        verify(notificationDao, never()).existsByUser_IdAndTypeAndIdToRedirectAndTargetDate(anyLong(), any(), anyLong(), any());
        verify(notificationDao, never()).save(any());
    }

    @Test
    void testCreateDailyWrappedReminders_onDec22_createsForAllUsers() {
        LocalDate date = LocalDate.of(2025, 12, 22);
        setClock(date);

        User user1 = new User("u1", "u1", "u1@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user1.setId(1L);
        User user2 = new User("u2", "u2", "u2@test.com", "124", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user2.setId(2L);
        List<User> users = List.of(user1, user2);

        when(userDao.findAll()).thenReturn(users);
        when(notificationDao.existsByUser_IdAndTypeAndIdToRedirectAndTargetDate(anyLong(), eq(Notification.NotificationType.WRAPPED_REMINDER), eq(2025L), eq(date))).thenReturn(false);

        notificationService.createDailyWrappedReminders();

        verify(userDao).findAll();
        verify(notificationDao, times(2)).existsByUser_IdAndTypeAndIdToRedirectAndTargetDate(anyLong(), eq(Notification.NotificationType.WRAPPED_REMINDER), eq(2025L), eq(date));
        verify(notificationDao, times(2)).save(any(Notification.class));
    }

    @Test
    void testCreateDailyWrappedReminders_idempotent_noDuplicates() {
        LocalDate date = LocalDate.of(2025, 12, 22);
        setClock(date);

        User user = new User("u", "u", "u@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);
        List<User> users = List.of(user);

        when(userDao.findAll()).thenReturn(users);
        when(notificationDao.existsByUser_IdAndTypeAndIdToRedirectAndTargetDate(1L, Notification.NotificationType.WRAPPED_REMINDER, 2025L, date)).thenReturn(false).thenReturn(true);

        notificationService.createDailyWrappedReminders();
        notificationService.createDailyWrappedReminders();

        verify(notificationDao, times(1)).save(any(Notification.class));
    }

    private void setClock(LocalDate date) {
        ZoneId zone = ZoneId.of("Europe/Madrid");
        Instant instant = date.atStartOfDay(zone).toInstant();
        when(clock.getZone()).thenReturn(zone);
        when(clock.instant()).thenReturn(instant);
    }
}