package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

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

        assertEquals(3, list.size());
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

        assertEquals(3, list.size());
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

        achievementProgressService.onFinishedWorkout(u.getId(), 3600, 50);

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

        achievementProgressService.onFinishedWorkout(u.getId(), 3600, 50);

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

        assertEquals(3, after.size());
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
}