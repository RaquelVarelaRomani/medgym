package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExerciseMaxWeightServiceTest {

    @Autowired
    private ExerciseMaxWeightService exerciseMaxWeightService;

    @Autowired
    private ExerciseMaxWeightDao exerciseMaxWeightDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserFollowDao userFollowDao;

    private User createUser(String email) {
        User u = new User(email, "pass", "n", "l", email, User.RoleType.CLIENT, User.StatusType.ACTIVE);
        return userDao.save(u);
    }

    private Exercise createExercise(String name) {
        Exercise e = new Exercise(name, "d",
                Exercise.ExerciseStatus.APPROVED);
        return exerciseDao.save(e);
    }

    @Test
    void testAddOrUpdateMaxWeightCreatesRecord() throws Exception {
        User u = createUser("a@a");
        Exercise e = createExercise("ex");

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 50);

        ExerciseMaxWeight found = exerciseMaxWeightDao.findByUserIdAndExerciseId(u.getId(), e.getId());
        assertNotNull(found);
        assertEquals((short) 50, found.getMaxWeightKg());
    }

    @Test
    void testAddOrUpdateMaxWeightUpdatesExisting() throws Exception {
        User u = createUser("b@b");
        Exercise e = createExercise("ex2");

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 40);
        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 60);

        ExerciseMaxWeight found = exerciseMaxWeightDao.findByUserIdAndExerciseId(u.getId(), e.getId());
        assertEquals((short) 60, found.getMaxWeightKg());
    }

    @Test
    void testAddOrUpdateMaxWeightUserNotFound() {
        Exercise e = createExercise("ex3");

        assertThrows(InstanceNotFoundException.class,
                () -> exerciseMaxWeightService.addOrUpdateMaxWeight(999L, e.getId(), (short) 20));
    }

    @Test
    void testAddOrUpdateMaxWeightExerciseNotFound() {
        User u = createUser("c@c");

        assertThrows(InstanceNotFoundException.class,
                () -> exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), 999L, (short) 20));
    }

    @Test
    void testGetRankingIncludesUserOnlyIfExists() throws Exception {
        User u = createUser("d@d");
        Exercise e = createExercise("ex4");

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 30);

        List<ExerciseMaxWeight> ranking = exerciseMaxWeightService.getMaxWeightRanking(u.getId(), e.getId());

        assertEquals(1, ranking.size());
        assertEquals((short) 30, ranking.get(0).getMaxWeightKg());
    }

    @Test
    void testGetRankingIncludesFollowers() throws Exception {
        User u = createUser("u@u");
        User f1 = createUser("f1@f");
        User f2 = createUser("f2@f");
        Exercise e = createExercise("ex5");

        userFollowDao.save(new UserFollow(u, f1));
        userFollowDao.save(new UserFollow(u, f2));

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 40);
        exerciseMaxWeightService.addOrUpdateMaxWeight(f1.getId(), e.getId(), (short) 55);

        List<ExerciseMaxWeight> ranking = exerciseMaxWeightService.getMaxWeightRanking(u.getId(), e.getId());

        assertEquals(2, ranking.size());
        assertTrue(ranking.stream().anyMatch(x -> x.getUser().getId().equals(u.getId())));
        assertTrue(ranking.stream().anyMatch(x -> x.getUser().getId().equals(f1.getId())));
    }

    @Test
    void testRankingSkipsFollowersWithoutRecord() throws Exception {
        User u = createUser("x@x");
        User f1 = createUser("f1@x");
        Exercise e = createExercise("ex6");

        userFollowDao.save(new UserFollow(u, f1));

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), (short) 70);

        List<ExerciseMaxWeight> ranking = exerciseMaxWeightService.getMaxWeightRanking(u.getId(), e.getId());

        assertEquals(1, ranking.size());
        assertEquals(u.getId(), ranking.get(0).getUser().getId());
    }

    @Test
    void testRankingEmptyWhenUserHasNoRecord() throws Exception {
        User u = createUser("z@z");
        Exercise e = createExercise("ex7");

        List<ExerciseMaxWeight> ranking = exerciseMaxWeightService.getMaxWeightRanking(u.getId(), e.getId());
        assertTrue(ranking.isEmpty());
    }

    @Test
    void addOrUpdateDoesNothingWhenNullWeight() throws Exception {
        User u = createUser("null@w");
        Exercise e = createExercise("nullWeight");

        exerciseMaxWeightService.addOrUpdateMaxWeight(u.getId(), e.getId(), null);

        assertNull(
                exerciseMaxWeightDao.findByUserIdAndExerciseId(u.getId(), e.getId())
        );
    }
}
