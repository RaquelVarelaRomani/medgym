package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExerciseServiceTest {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    private User createPremiumTrainer(String userName) {
        User user = new User(userName, "password", "name", "lastName",
                userName, RoleType.TRAINER, User.StatusType.ACTIVE);
        user.setTrainerPremium(true);
        return userDao.save(user);
    }

    private Exercise createBasicExercise(User user, String name)
            throws DuplicateInstanceException, PermissionException {

        return exerciseService.createExercise(
                name,
                "descripcion",
                MuscleGroup.LEG,
                Equipment.DUMBBELL,
                Exercise.ExerciseType.STRENGTH,
                new byte[]{1},
                user
        );
    }

    @Test
    void testCreateAndFindExercise() throws Exception {
        User user = createPremiumTrainer("t1@test");
        Exercise e = createBasicExercise(user, "ex");
        Exercise found = exerciseService.findExerciseById(e.getId());
        assertEquals(e.getId(), found.getId());
    }

    @Test
    void testCreateDuplicateExercise() throws Exception {
        User user = createPremiumTrainer("t2@test");
        createBasicExercise(user, "ex");
        assertThrows(DuplicateInstanceException.class, () -> createBasicExercise(user, "ex"));
    }

    @Test
    void testUpdateExercise() throws Exception {
        User user = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(user, "ex");

        exerciseService.updateExercise(e.getId(), "n", "d2", MuscleGroup.BACK, Equipment.BARBELL, new byte[]{2});
        Exercise updated = exerciseService.findExerciseById(e.getId());

        assertEquals("n", updated.getName());
        assertEquals("d2", updated.getDescription());
        assertEquals(MuscleGroup.BACK, updated.getMuscleGroup());
        assertEquals(Equipment.BARBELL, updated.getEquipment());
    }

    @Test
    void testUpdateExerciseDuplicateName() throws Exception {
        User user = createPremiumTrainer("t@test");
        createBasicExercise(user, "ex1");
        Exercise e2 = createBasicExercise(user, "ex2");

        assertThrows(DuplicateInstanceException.class,
                () -> exerciseService.updateExercise(e2.getId(), "ex1", "xx",
                        MuscleGroup.LEG, Equipment.NONE, new byte[]{1}));
    }

    @Test
    void testDeleteExercise() throws Exception {
        User user = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(user, "ex");
        exerciseService.deleteExercise(e.getId());
        assertThrows(InstanceNotFoundException.class, () -> exerciseService.findExerciseById(e.getId()));
    }

    @Test
    void testDeleteNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class, () -> exerciseService.deleteExercise(999L));
    }

    @Test
    void testDeleteExerciseInUse() throws Exception {
        User trainer = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(trainer, "ex");

        Routine r = new Routine("Rut", "Desc",
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routineDao.save(r);

        RoutineExercise re = new RoutineExercise(r, e, 1);
        routineExerciseDao.save(re);

        var exerciseId = e.getId();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> exerciseService.deleteExercise(exerciseId));

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(Objects.requireNonNull(ex.getReason()).contains("No se puede borrar"));
    }

    @Test
    void testFindNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class, () -> exerciseService.findExerciseById(999L));
    }

    @Test
    void testCreateExerciseWithDefaultStatus() throws Exception {
        User trainer = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(trainer, "ex");
        assertEquals(ExerciseStatus.PENDING, e.getStatus());
    }

    @Test
    void testUpdateExerciseStatus() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");

        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.APPROVED);
        Exercise updated = exerciseService.findExerciseById(e.getId());

        assertEquals(ExerciseStatus.APPROVED, updated.getStatus());
    }

    @Test
    void testUpdateExerciseStatusNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class,
                () -> exerciseService.updateExerciseStatus(999L, ExerciseStatus.REJECTED));
    }

    @Test
    void testUpdateExerciseStatusToNull() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");
        exerciseService.updateExerciseStatus(e.getId(), null);
        assertNull(exerciseService.findExerciseById(e.getId()).getStatus());
    }

    @Test
    void testUpdateExerciseStatusToSameValue() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");
        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.PENDING);
        assertEquals(ExerciseStatus.PENDING, exerciseService.findExerciseById(e.getId()).getStatus());
    }

    @Test
    void testUpdateExerciseStatusMultipleTimes() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");

        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.APPROVED);
        assertEquals(ExerciseStatus.APPROVED, exerciseService.findExerciseById(e.getId()).getStatus());

        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.REJECTED);
        assertEquals(ExerciseStatus.REJECTED, exerciseService.findExerciseById(e.getId()).getStatus());

        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.PENDING);
        assertEquals(ExerciseStatus.PENDING, exerciseService.findExerciseById(e.getId()).getStatus());
    }

    @Test
    void testUpdateExerciseStatusAfterNameChange() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");

        exerciseService.updateExercise(e.getId(), "n", "d", MuscleGroup.ARM, Equipment.DUMBBELL, new byte[]{1});
        exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.APPROVED);

        Exercise updated = exerciseService.findExerciseById(e.getId());

        assertEquals("n", updated.getName());
        assertEquals("d", updated.getDescription());
        assertEquals(ExerciseStatus.APPROVED, updated.getStatus());
    }

    @Test
    void testUpdateExerciseStatusAfterDeletion() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");
        exerciseService.deleteExercise(e.getId());
        assertThrows(InstanceNotFoundException.class,
                () -> exerciseService.updateExerciseStatus(e.getId(), ExerciseStatus.REJECTED));
    }

    @Test
    void testFindAllExercises() throws Exception {
        User t = createPremiumTrainer("t@test");
        int initial = exerciseService.findAllExercises(t.getId()).size();

        Exercise e1 = createBasicExercise(t, "e1");
        Exercise e2 = createBasicExercise(t, "e2");

        exerciseService.updateExerciseStatus(e1.getId(), ExerciseStatus.APPROVED);
        exerciseService.updateExerciseStatus(e2.getId(), ExerciseStatus.APPROVED);

        var list = exerciseService.findAllExercises(t.getId());
        assertEquals(initial + 2, list.size());
    }

    @Test
    void testFindExercisesWithPendingStatus() throws Exception {
        User t = createPremiumTrainer("t@test");

        int initial = exerciseService.findExercisesWithPendingStatus().size();

        Exercise e1 = createBasicExercise(t, "e1");

        var list = exerciseService.findExercisesWithPendingStatus();
        assertEquals(initial + 1, list.size());
        assertTrue(list.stream().anyMatch(x -> x.getId().equals(e1.getId())));
    }

    @Test
    void testFindExercisesWithPendingStatusWhenNone() throws Exception {
        User t = createPremiumTrainer("t@test");
        int initial = exerciseService.findExercisesWithPendingStatus().size();

        Exercise e1 = createBasicExercise(t, "e1");
        Exercise e2 = createBasicExercise(t, "e2");

        exerciseService.updateExerciseStatus(e1.getId(), ExerciseStatus.APPROVED);
        exerciseService.updateExerciseStatus(e2.getId(), ExerciseStatus.REJECTED);

        var list = exerciseService.findExercisesWithPendingStatus();
        assertEquals(initial, list.size());
    }

    @Test
    void testFindExercisesWithPendingStatusWhenAll() throws Exception {
        User t = createPremiumTrainer("t@test");
        int initial = exerciseService.findExercisesWithPendingStatus().size();

        createBasicExercise(t, "e1");
        createBasicExercise(t, "e2");

        var list = exerciseService.findExercisesWithPendingStatus();
        assertEquals(initial + 2, list.size());
    }

    @Test
    void testFindExercisesWithPendingStatusAfterDeletion() throws Exception {
        User t = createPremiumTrainer("t@test");

        int initial = exerciseService.findExercisesWithPendingStatus().size();

        Exercise e1 = createBasicExercise(t, "e1");
        Exercise e2 = createBasicExercise(t, "e2");

        exerciseService.deleteExercise(e1.getId());

        var list = exerciseService.findExercisesWithPendingStatus();
        assertEquals(initial + 1, list.size());
        assertTrue(list.stream().anyMatch(x -> x.getId().equals(e2.getId())));
    }

    @Test
    void testFindExercisesWithPendingStatusAfterStatusUpdate() throws Exception {
        User t = createPremiumTrainer("t@test");

        int initial = exerciseService.findExercisesWithPendingStatus().size();

        Exercise e1 = createBasicExercise(t, "e1");
        Exercise e2 = createBasicExercise(t, "e2");

        exerciseService.updateExerciseStatus(e1.getId(), ExerciseStatus.APPROVED);

        var list = exerciseService.findExercisesWithPendingStatus();
        assertEquals(initial + 1, list.size());
        assertTrue(list.stream().anyMatch(x -> x.getId().equals(e2.getId())));
    }

    @Test
    void testCreateExerciseSetsDefaultStatus() throws Exception {
        User t = createPremiumTrainer("t@test");
        Exercise e = createBasicExercise(t, "ex");
        assertEquals(ExerciseStatus.PENDING, e.getStatus());
    }

    @Test
    void testFindAllMuscleGroups() {
        var groups = exerciseService.findAllMuscleGroups();
        assertEquals(MuscleGroup.values().length, groups.size());
    }

    @Test
    void testFindAllEquipments() {
        var eq = exerciseService.findAllEquipments();
        assertEquals(Equipment.values().length, eq.size());
    }

    @Test
    void testUpdateExerciseNonExistent() {
        assertThrows(InstanceNotFoundException.class,
                () -> exerciseService.updateExercise(999L, "x", "y",
                        MuscleGroup.LEG, Equipment.NONE, new byte[]{1}));
    }

    @Test
    void testFindAllExercisesUserNotFound() {
        assertThrows(InstanceNotFoundException.class,
                () -> exerciseService.findAllExercises(999L));
    }
}
