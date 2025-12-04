package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutCommentServiceUnitTest {

    @Mock
    private WorkoutCommentDao workoutCommentDao;

    @Mock
    private UserDao userDao;

    @Mock
    private WorkoutDao workoutDao;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AchievementProgressService achievementProgressService;

    @InjectMocks
    private WorkoutCommentServiceImpl workoutCommentService;

    @Test
    void testCommentWorkout_IncrementsCounterAndCallsAchievementService() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Great workout!";
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setTotalComments(4);
        Workout workout = new Workout();
        workout.setId(workoutId);
        WorkoutComment savedComment = new WorkoutComment(text, LocalDateTime.now(), workout, user);
        savedComment.setId(10L);

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(achievementProgressService.createOrUpdateAchievementProgress(eq(userId), eq(7L), eq(1))).thenReturn(Collections.emptyList());
        when(workoutCommentDao.save(any(WorkoutComment.class))).thenReturn(savedComment);

        WorkoutComment result = workoutCommentService.commentWorkout(userId, text, workoutId);

        assertEquals(savedComment, result);
        assertEquals(5, user.getTotalComments()); // incremented by 1
        verify(workoutCommentDao).save(any(WorkoutComment.class));
        verify(userDao).save(user);
        verify(achievementProgressService).createOrUpdateAchievementProgress(userId, 7L, 1);
        verify(notificationService).createWorkoutCommentNotification(userId, text, workoutId);
    }

    @Test
    void testCommentWorkout_UserNotFound_ThrowsException() {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Comment";

        when(userDao.findById(userId)).thenReturn(Optional.empty());

        assertThrows(InstanceNotFoundException.class, () -> workoutCommentService.commentWorkout(userId, text, workoutId));
    }

    @Test
    void testCommentWorkout_WorkoutNotFound_ThrowsException() {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Comment";
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.empty());

        assertThrows(InstanceNotFoundException.class, () -> workoutCommentService.commentWorkout(userId, text, workoutId));
    }

    @Test
    void testCommentWorkout_ReachesBronzeAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Nice!";
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setTotalComments(4); // 4 + 1 = 5, reaches bronze
        Workout workout = new Workout();
        workout.setId(workoutId);
        WorkoutComment savedComment = new WorkoutComment(text, LocalDateTime.now(), workout, user);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(achievementProgressService.createOrUpdateAchievementProgress(eq(userId), eq(7L), eq(1))).thenReturn(List.of(achievementDto));
        when(workoutCommentDao.save(any(WorkoutComment.class))).thenReturn(savedComment);

        WorkoutComment result = workoutCommentService.commentWorkout(userId, text, workoutId);

        assertEquals(savedComment, result);
        assertEquals(5, user.getTotalComments());
        verify(achievementProgressService).createOrUpdateAchievementProgress(userId, 7L, 1);
    }

    @Test
    void testCommentWorkout_ReachesSilverAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Good job!";
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setTotalComments(19); // 19 + 1 = 20, reaches silver
        Workout workout = new Workout();
        workout.setId(workoutId);
        WorkoutComment savedComment = new WorkoutComment(text, LocalDateTime.now(), workout, user);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(achievementProgressService.createOrUpdateAchievementProgress(eq(userId), eq(7L), eq(1))).thenReturn(List.of(achievementDto));
        when(workoutCommentDao.save(any(WorkoutComment.class))).thenReturn(savedComment);

        WorkoutComment result = workoutCommentService.commentWorkout(userId, text, workoutId);

        assertEquals(savedComment, result);
        assertEquals(20, user.getTotalComments());
        verify(achievementProgressService).createOrUpdateAchievementProgress(userId, 7L, 1);
    }

    @Test
    void testCommentWorkout_ReachesGoldAchievement() throws InstanceNotFoundException {
        Long userId = 1L;
        Long workoutId = 2L;
        String text = "Excellent!";
        User user = new User("user", "user", "user@test.com", "123", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setTotalComments(49); // 49 + 1 = 50, reaches gold
        Workout workout = new Workout();
        workout.setId(workoutId);
        WorkoutComment savedComment = new WorkoutComment(text, LocalDateTime.now(), workout, user);
        AchievementProgressDto achievementDto = new AchievementProgressDto();

        when(userDao.findById(userId)).thenReturn(Optional.of(user));
        when(workoutDao.findById(workoutId)).thenReturn(Optional.of(workout));
        when(achievementProgressService.createOrUpdateAchievementProgress(eq(userId), eq(7L), eq(1))).thenReturn(List.of(achievementDto));
        when(workoutCommentDao.save(any(WorkoutComment.class))).thenReturn(savedComment);

        WorkoutComment result = workoutCommentService.commentWorkout(userId, text, workoutId);

        assertEquals(savedComment, result);
        assertEquals(50, user.getTotalComments());
        verify(achievementProgressService).createOrUpdateAchievementProgress(userId, 7L, 1);
    }

    @Test
    void testFindWorkoutCommentById() throws InstanceNotFoundException {
        Long commentId = 10L;
        WorkoutComment comment = new WorkoutComment();

        when(workoutCommentDao.findById(commentId)).thenReturn(Optional.of(comment));

        WorkoutComment result = workoutCommentService.findWorkoutCommentById(commentId);

        assertEquals(comment, result);
    }

    @Test
    void testFindWorkoutCommentById_NotFound_ThrowsException() {
        Long commentId = 10L;

        when(workoutCommentDao.findById(commentId)).thenReturn(Optional.empty());

        assertThrows(InstanceNotFoundException.class, () -> workoutCommentService.findWorkoutCommentById(commentId));
    }

    @Test
    void testGetWorkoutComments() {
        Long workoutId = 2L;
        List<WorkoutComment> comments = List.of(new WorkoutComment(), new WorkoutComment());

        when(workoutCommentDao.findByWorkoutId(workoutId)).thenReturn(comments);

        List<WorkoutComment> result = workoutCommentService.getWorkoutComments(workoutId);

        assertEquals(comments, result);
    }

    @Test
    void testDeleteWorkoutComment() {
        Long commentId = 10L;

        workoutCommentService.deleteWorkoutComment(commentId);

        verify(workoutCommentDao).findById(commentId);
    }
}