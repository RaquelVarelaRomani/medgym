package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.aspectj.apache.bcel.classfile.Module;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AchievementProgressServiceTest {

    @Autowired
    private AchievementProgressService achievementProgressService;

    @Autowired
    private AchievementDao achievementDao;

    @Autowired
    private AchievementProgressDao achievementProgressDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineDao routineDao;

    private User createUser(String name) {
        return userDao.save(new User(
                name, name, name + "@test.com",
                "600000000", "pass",
                User.RoleType.CLIENT,
                User.StatusType.ACTIVE
        ));
    }

    private Achievement aHours() {
        return achievementDao.findById(1L).orElseThrow();
    }

    private Achievement aReps() {
        return achievementDao.findById(2L).orElseThrow();
    }

    private Achievement aSessions() {
        return achievementDao.findById(3L).orElseThrow();
    }

    private Achievement aMaxWeight() {
        return achievementDao.findByName("Levantando el Gym").orElseThrow();
    }

    @Test
    void testConstructorAndGettersSetters() {

        User user = new User();
        Achievement ach = new Achievement("N", "D", 1, 2, 3);

        AchievementProgress p = new AchievementProgress();

        p.setId(5L);
        p.setProgress(42);
        p.setUser(user);
        p.setAchievement(ach);

        assertEquals(5L, p.getId());
        assertEquals(42, p.getProgress());
        assertEquals(user, p.getUser());
        assertEquals(ach, p.getAchievement());
    }

    @Test
    void testFullConstructor() {

        User user = new User();
        Achievement ach = new Achievement("N2", "D2", 4, 5, 6);

        AchievementProgress p =
                new AchievementProgress(77, user, ach);

        assertEquals(77, p.getProgress());
        assertEquals(user, p.getUser());
        assertEquals(ach, p.getAchievement());
    }

    @Test
    void testCreateAchievementProgress() throws Exception {
        User u = createUser("u1");
        Achievement a = aHours();

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), a.getId(), 5);

        AchievementProgress ap =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), a.getId());

        assertNotNull(ap.getId());
        assertEquals(5, ap.getProgress());
    }


    @Test
    void testUpdateAchievementProgress() throws Exception {
        User u = createUser("u2");
        Achievement a = aReps();

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), a.getId(), 3);

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), a.getId(), 10);

        AchievementProgress updated =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), a.getId());

        assertEquals(13, updated.getProgress());
    }


    @Test
    void testFindAchievementProgress() throws Exception {
        User u = createUser("u3");
        Achievement a = aSessions();

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), a.getId(), 4);

        AchievementProgress ap =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), a.getId());

        assertNotNull(ap);
        assertEquals(4, ap.getProgress());
    }


    @Test
    void testFindAchievementProgressNotExisting() {
        User u = createUser("u4");
        Achievement a = aHours();

        AchievementProgress ap =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), a.getId());

        assertNull(ap);
    }


    @Test
    void testFindAchievementProgressesByUserCreatesMissingOnes() throws Exception {
        User u = createUser("u5");

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), aHours().getId(), 7);

        List<AchievementProgress> list =
                achievementProgressService.findAchievementProgressesByUser(u.getId());

        assertEquals(7, list.size());
        assertEquals(7,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId())
                        .getProgress());
        assertEquals(0,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aReps().getId())
                        .getProgress());
        assertEquals(0,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aSessions().getId())
                        .getProgress());
    }


    @Test
    void testFindAchievementProgressesByUserWithNone() throws Exception {
        User u = createUser("u6");

        List<AchievementProgress> list =
                achievementProgressService.findAchievementProgressesByUser(u.getId());

        assertEquals(7, list.size());
        assertEquals(0,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId())
                        .getProgress());
        assertEquals(0,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aReps().getId())
                        .getProgress());
        assertEquals(0,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aSessions().getId())
                        .getProgress());
    }


    @Test
    void testCreateOrUpdateThrowsUserNotFound() {
        Achievement a = aHours();

        assertThrows(InstanceNotFoundException.class, () ->
                achievementProgressService.createOrUpdateAchievementProgress(
                        9999L, a.getId(), 1));
    }


    @Test
    void testCreateOrUpdateThrowsAchievementNotFound() {
        User u = createUser("u7");

        assertThrows(InstanceNotFoundException.class, () ->
                achievementProgressService.createOrUpdateAchievementProgress(
                        u.getId(), 9999L, 1));
    }


    @Test
    void testOnFinishedWorkoutCreatesProgressForThreeAchievements() throws Exception {
        User u = createUser("u8");

        achievementProgressService.onFinishedWorkout(u.getId(), 3600, 50, 1L);

        assertEquals(3600,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId()).getProgress());
        assertEquals(50,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aReps().getId()).getProgress());
        assertEquals(1,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aSessions().getId()).getProgress());
    }


    @Test
    void testOnFinishedWorkoutUpdatesExistingProgress() throws Exception {
        User u = createUser("u9");

        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aHours().getId(), 100);
        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aReps().getId(), 20);
        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aSessions().getId(), 1);

        achievementProgressService.onFinishedWorkout(u.getId(), 3600, 50, 1L);

        assertEquals(100 + 3600,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId()).getProgress());
        assertEquals(20 + 50,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aReps().getId()).getProgress());
        assertEquals(1 + 1,
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aSessions().getId()).getProgress());
    }


    @Test
    void testFindAchievementProgressesByUserWhenAllExistDoesNotCreateNew() throws Exception {
        User u = createUser("u10");

        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aHours().getId(), 1);
        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aReps().getId(), 2);
        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aSessions().getId(), 3);

        List<AchievementProgress> before = achievementProgressDao.findByUserId(u.getId());
        assertEquals(3, before.size());

        List<AchievementProgress> after = achievementProgressService.findAchievementProgressesByUser(u.getId());

        assertEquals(7, after.size());
    }


    @Test
    void testUpdateAchievementProgressWhenZeroCreatedAuto() throws Exception {
        User u = createUser("u11");

        achievementProgressService.findAchievementProgressesByUser(u.getId());

        AchievementProgress p0 =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId());
        assertEquals(0, p0.getProgress());

        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aHours().getId(), 5);

        AchievementProgress p1 =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), aHours().getId());
        assertEquals(5, p1.getProgress());
    }


    @Test
    void testCreateAchievementProgressWithZeroAdded() throws Exception {
        User u = createUser("u12");
        Achievement a = aReps();

        achievementProgressService.createOrUpdateAchievementProgress(
                u.getId(), a.getId(), 0);

        AchievementProgress ap =
                achievementProgressDao.findByUserIdAndAchievementId(u.getId(), a.getId());

        assertNotNull(ap);
        assertEquals(0, ap.getProgress());
    }

    @Test
    void testMaxWeightArchievement() throws Exception {
        User u = createUser("u15");
        achievementProgressService.createOrUpdateAchievementProgress(u.getId(), aMaxWeight().getId(), 1);
        assertEquals(1, achievementProgressService.findAchievementProgress(u.getId(), aMaxWeight().getId()).getProgress());
    }

    @Test
    void testOnFinishedWorkoutUpdatesStreakAchievements() throws Exception {
        User u = createUser("streakUser");
        Routine r = routineDao.save(new Routine("R", "D", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, u));

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);

        createWorkout(u, r, twoDaysAgo.atTime(10, 0), twoDaysAgo.atTime(11, 0));
        createWorkout(u, r, yesterday.atTime(10, 0), yesterday.atTime(11, 0));
        createWorkout(u, r, today.atTime(10, 0), today.atTime(11, 0));

        achievementProgressService.onFinishedWorkout(u.getId(), 3600, 10, 1L);

        AchievementProgress ap = achievementProgressDao.findByUserIdAndAchievementId(u.getId(), 4L);
        assertNotNull(ap);
        assertEquals(3, ap.getProgress());
    }

    private void createWorkout(User user, Routine routine, LocalDateTime start, LocalDateTime end) {
        Workout workout = new Workout(start, end, routine, user);
        workoutDao.save(workout);
    }
}