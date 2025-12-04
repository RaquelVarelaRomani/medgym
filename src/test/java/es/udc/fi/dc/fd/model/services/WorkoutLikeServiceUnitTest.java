package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutLikeServiceUnitTest {

    @Mock
    private WorkoutLikeDao workoutLikeDao;

    @Mock
    private NotificationService notificationService;

    @Mock
    private WorkoutDao workoutDao;

    @Mock
    private UserDao userDao;

    @Mock
    private AchievementProgressService achievementProgressService;

    @InjectMocks
    private WorkoutLikeServiceImpl workoutLikeService;

    @Test
    void testLikeWorkout_IncrementsCounterAndCallsAchievementService() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Workout workout = new Workout();
        workout.setId(workoutId);

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(workoutLikeDao.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, 1)).thenReturn(Collections.emptyList());

        List<AchievementProgressDto> result = workoutLikeService.likeWorkout(userId, workoutId);

        assertEquals(Collections.emptyList(), result);
        verify(workoutLikeDao).save(any(WorkoutLike.class));
        verify(achievementProgressService).createOrUpdateAchievementProgress(userId, 6L, 1);
        verify(notificationService).createWorkoutLikeNotification(userId, workoutId);
    }

    @Test
    void testLikeWorkout_AlreadyLiked_ReturnsEmptyList() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Workout workout = new Workout();
        workout.setId(workoutId);
        WorkoutLike existingLike = new WorkoutLike(workout, user);

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(workoutLikeDao.findByUserId(userId)).thenReturn(List.of(existingLike));

        List<AchievementProgressDto> result = workoutLikeService.likeWorkout(userId, workoutId);

        assertEquals(Collections.emptyList(), result);
        verify(workoutLikeDao, never()).save(any(WorkoutLike.class));
        verify(userDao, never()).save(any(User.class));
        verify(achievementProgressService, never()).createOrUpdateAchievementProgress(any(), any(), any());
    }

    @Test
    void testLikeWorkout_UserNotFound_ThrowsException() {
        Long userId = 1L;
        Long workoutId = 2L;

        when(userDao.findById(userId)).thenReturn(Optional.empty());

        assertThrows(InstanceNotFoundException.class, () -> workoutLikeService.likeWorkout(userId, workoutId));
    }

    @Test
    void testLikeWorkout_WorkoutNotFound_ThrowsException() {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.empty());

        assertThrows(InstanceNotFoundException.class, () -> workoutLikeService.likeWorkout(userId, workoutId));
    }


    @Test
    void testLikeWorkout_ReachesBronzeAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Workout workout = new Workout();
        workout.setId(workoutId);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(workoutLikeDao.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, 1)).thenReturn(List.of(achievementDto));

        List<AchievementProgressDto> result = workoutLikeService.likeWorkout(userId, workoutId);

        assertEquals(1, result.size());
    }

    @Test
    void testLikeWorkout_ReachesSilverAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Workout workout = new Workout();
        workout.setId(workoutId);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(workoutLikeDao.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, 1)).thenReturn(List.of(achievementDto));

        List<AchievementProgressDto> result = workoutLikeService.likeWorkout(userId, workoutId);

        assertEquals(1, result.size());
        assertEquals(achievementDto, result.get(0));
    }

    @Test
    void testLikeWorkout_ReachesGoldAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(userId);
        Workout workout = new Workout();
        workout.setId(workoutId);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(workoutLikeDao.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, 1)).thenReturn(List.of(achievementDto));

        List<AchievementProgressDto> result = workoutLikeService.likeWorkout(userId, workoutId);

        assertEquals(1, result.size());
        assertEquals(achievementDto, result.get(0));
    }
}