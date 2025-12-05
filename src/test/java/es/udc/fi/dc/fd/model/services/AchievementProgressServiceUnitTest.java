package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AchievementProgressServiceUnitTest {

    @Mock
    private UserDao userDao;

    @Mock
    private AchievementDao achievementDao;

    @Mock
    private AchievementProgressDao achievementProgressDao;

    @Mock
    private WorkoutService workoutService;

    @Mock
    private WorkoutLikeDao workoutLikeDao;

    @Mock
    private WorkoutCommentDao workoutCommentDao;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AchievementProgressServiceImpl achievementProgressService;

    @Test
    void testCreateOrUpdateAchievementProgress_ReachesBronzeTier_CreatesNotification() throws InstanceNotFoundException {
        Long userId = 1L;
        Long achievementId = 1L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Achievement achievement = new Achievement("Test Achievement", "Test Description", 10, 20, 30);
        achievement.setId(achievementId);
        AchievementProgress existingProgress = new AchievementProgress(5, user, achievement);
        existingProgress.setHighestProgress(5);

        when(achievementDao.findById(achievementId)).thenReturn(Optional.of(achievement));
        when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(existingProgress);

        List<AchievementProgressDto> result = achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, 5);

        assertEquals(1, result.size());
        AchievementProgressDto dto = result.get(0);
        assertEquals("Test Achievement", dto.getName());
        assertEquals("Test Description", dto.getDescription());
        verify(notificationService).createAchievementNotification(userId, "Logro desbloqueado: Test Achievement", userId);
    }

    @Test
    void testCreateOrUpdateAchievementProgress_ReachesSilverTier_CreatesNotification() throws InstanceNotFoundException {
        Long userId = 1L;
        Long achievementId = 1L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Achievement achievement = new Achievement("Test Achievement", "Test Description", 10, 20, 30);
        achievement.setId(achievementId);
        AchievementProgress existingProgress = new AchievementProgress(15, user, achievement);
        existingProgress.setHighestProgress(15);

        when(achievementDao.findById(achievementId)).thenReturn(Optional.of(achievement));
        when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(existingProgress);

        List<AchievementProgressDto> result = achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, 5);

        assertEquals(1, result.size());
        verify(notificationService).createAchievementNotification(userId, "Logro desbloqueado: Test Achievement", userId);
    }

    @Test
    void testCreateOrUpdateAchievementProgress_ReachesGoldTier_CreatesNotification() throws InstanceNotFoundException {
        Long userId = 1L;
        Long achievementId = 1L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Achievement achievement = new Achievement("Test Achievement", "Test Description", 10, 20, 30);
        achievement.setId(achievementId);
        AchievementProgress existingProgress = new AchievementProgress(25, user, achievement);
        existingProgress.setHighestProgress(25);

        when(achievementDao.findById(achievementId)).thenReturn(Optional.of(achievement));
        when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(existingProgress);

        List<AchievementProgressDto> result = achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, 5);

        assertEquals(1, result.size());
        verify(notificationService).createAchievementNotification(userId, "Logro desbloqueado: Test Achievement", userId);
    }

    @Test
    void testCreateOrUpdateAchievementProgress_NoTierReached_NoNotification() throws InstanceNotFoundException {
        Long userId = 1L;
        Long achievementId = 1L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Achievement achievement = new Achievement("Test Achievement", "Test Description", 10, 20, 30);
        achievement.setId(achievementId);
        AchievementProgress existingProgress = new AchievementProgress(10, user, achievement);
        existingProgress.setHighestProgress(10);

        when(achievementDao.findById(achievementId)).thenReturn(Optional.of(achievement));
        when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(existingProgress);

        List<AchievementProgressDto> result = achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, 5);

        assertEquals(0, result.size());
        verify(notificationService, never()).createAchievementNotification(any(), any(), any());
    }

    @Test
    void testCreateOrUpdateAchievementProgress_ReachesMultipleTiers_CreatesMultipleNotifications() throws InstanceNotFoundException {
        Long userId = 1L;
        Long achievementId = 1L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Achievement achievement = new Achievement("Test Achievement", "Test Description", 10, 20, 30);
        achievement.setId(achievementId);
        // No existing progress, start from 0, add 35 to reach all tiers
        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(achievementDao.findById(achievementId)).thenReturn(Optional.of(achievement));
        when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(null);

        doAnswer(invocation -> {
            AchievementProgress ap = invocation.getArgument(0);
            when(achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId)).thenReturn(ap);
            return null;
        }).when(achievementProgressDao).save(any());

        List<AchievementProgressDto> result = achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, 35);

        assertEquals(1, result.size()); // one dto for the achievement unlock
        verify(notificationService).createAchievementNotification(userId, "Logro desbloqueado: Test Achievement", userId);
    }
}