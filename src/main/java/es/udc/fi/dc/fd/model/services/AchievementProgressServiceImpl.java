package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;

import static es.udc.fi.dc.fd.rest.dtos.AchievementProgressConversor.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AchievementProgressServiceImpl implements AchievementProgressService {

    private final UserDao userDao;
    private final AchievementDao achievementDao;
    private final AchievementProgressDao achievementProgressDao;
    private final WorkoutService workoutService;
    private final WorkoutExerciseDao workoutExerciseDao;
    private final WorkoutDao workoutDao;

    @PersistenceContext
    private EntityManager entityManager;

    private static final String PROJECT_ENTITIES_USER = "entities.user";
    private static final String PROJECT_ENTITIES_ACHIEVEMENT = "entities.achievement";

    private static final Long HOURS_ACHIEVEMENT_ID = 1L;
    private static final Long REPS_ACHIEVEMENT_ID = 2L;
    private static final Long WORKOUTS_ACHIEVEMENT_ID = 3L;
    private static final Long STREAK_ACHIEVEMENT_ID = 4L;
    private static final Long MAX_WEIGHT_ACHIEVEMENT_ID = 5L;

    private static final Integer NO_PROGRESS = 0;

    public AchievementProgressServiceImpl(UserDao userDao, AchievementDao achievementDao, AchievementProgressDao achievementProgressDao, @Lazy WorkoutService workoutService, WorkoutExerciseDao workoutExerciseDao, WorkoutDao workoutDao) {
        this.userDao = userDao;
        this.achievementDao = achievementDao;
        this.achievementProgressDao = achievementProgressDao;
        this.workoutService = workoutService;
        this.workoutExerciseDao = workoutExerciseDao;
        this.workoutDao = workoutDao;
    }

    @Override
    public void createOrUpdateAchievementProgress(Long userId, Long achievementId, Integer progressAdded) throws InstanceNotFoundException {

        AchievementProgress achievementProgress = findAchievementProgress(userId, achievementId);

        if (achievementProgress == null) {
            User user = userDao.findById(userId)
                    .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, userId));
            Achievement achievement = achievementDao.findById(achievementId)
                    .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ACHIEVEMENT, achievementId));

            achievementProgressDao.save(new AchievementProgress(progressAdded, user, achievement));
        } else {
            achievementProgress.setProgress(achievementProgress.getProgress() + progressAdded);
        }
    }

    @Override
    public List<AchievementProgressDto> onFinishedWorkout(Long userId, Integer seconds, Integer reps, Long workoutId) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        newAchievements.addAll(updateAchievementProgress(userId, HOURS_ACHIEVEMENT_ID, seconds));
        newAchievements.addAll(updateAchievementProgress(userId, REPS_ACHIEVEMENT_ID, reps));
        newAchievements.addAll(updateAchievementProgress(userId, WORKOUTS_ACHIEVEMENT_ID, 1));

        Integer currentMaxWeight = calculateMaxWeightForWorkout(workoutId);
        if (currentMaxWeight > findMaxWeightByUser(userId, workoutId)) {
            newAchievements.addAll(updateAchievementProgress(userId, MAX_WEIGHT_ACHIEVEMENT_ID, 1));
        }
        
        int currentStreak = workoutService.calculateCurrentStreak(userId);
        newAchievements.addAll(updateStreakAchievements(userId, currentStreak));

        return newAchievements;
    }

    @Override
    public AchievementProgress findAchievementProgress(Long userId, Long achievementId) {
        return achievementProgressDao.findByUserIdAndAchievementId(userId, achievementId);
    }

    @Override
    public List<AchievementProgress> findAchievementProgressesByUser(Long userId) throws InstanceNotFoundException {

        List<Long> achievementIds = achievementDao.findAll().stream()
                .map(Achievement::getId)
                .toList();

        List<AchievementProgress> achievementProgresses =
                achievementProgressDao.findByUserId(userId);

        Set<Long> existingAchievementIds = achievementProgresses.stream()
                .map(ap -> ap.getAchievement().getId())
                .collect(Collectors.toSet());

        if (achievementIds.size() != achievementProgresses.size()) {

            for (Long achievementId : achievementIds) {
                if (!existingAchievementIds.contains(achievementId)) {
                    createOrUpdateAchievementProgress(userId, achievementId, NO_PROGRESS);
                }
            }

            return achievementProgressDao.findByUserId(userId);
        }

        return achievementProgresses;
    }

    private List<AchievementProgressDto> updateAchievementProgress(Long userId, Long achievementId, Integer progressAdded) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        AchievementProgress ap = findAchievementProgress(userId, achievementId);
        int oldProgress = (ap != null) ? ap.getProgress() : 0;

        createOrUpdateAchievementProgress(userId, achievementId, progressAdded);

        AchievementProgress updatedAp = findAchievementProgress(userId, achievementId);
        int newProgress = updatedAp.getProgress();
        Achievement achievement = achievementDao.findById(achievementId).orElseThrow(() -> new InstanceNotFoundException("Achievement", achievementId));

        boolean reachedBronze = oldProgress < achievement.getBronzeReq() && newProgress >= achievement.getBronzeReq();
        boolean reachedSilver = oldProgress < achievement.getSilverReq() && newProgress >= achievement.getSilverReq();
        boolean reachedGold = oldProgress < achievement.getGoldReq() && newProgress >= achievement.getGoldReq();

        if (reachedBronze || reachedSilver || reachedGold) {
            newAchievements.add(toAchievementProgressDto(updatedAp, achievement));
        }

        return newAchievements;
    }

    private List<AchievementProgressDto> updateStreakAchievements(Long userId, int currentStreak) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        AchievementProgress ap = findAchievementProgress(userId, STREAK_ACHIEVEMENT_ID);
        int oldProgress = (ap != null) ? ap.getProgress() : 0;

        if (ap == null) {
            createOrUpdateAchievementProgress(userId, STREAK_ACHIEVEMENT_ID, currentStreak);
        } else if (currentStreak > ap.getProgress()) {
            createOrUpdateAchievementProgress(userId, STREAK_ACHIEVEMENT_ID, currentStreak - ap.getProgress());
        }

        AchievementProgress updatedAp = findAchievementProgress(userId, STREAK_ACHIEVEMENT_ID);
        int newProgress = updatedAp.getProgress();
        Achievement streakAchievement = achievementDao.findById(STREAK_ACHIEVEMENT_ID).orElseThrow(() -> new InstanceNotFoundException("Achievement", STREAK_ACHIEVEMENT_ID));

        boolean reachedBronze = oldProgress < streakAchievement.getBronzeReq() && newProgress >= streakAchievement.getBronzeReq();
        boolean reachedSilver = oldProgress < streakAchievement.getSilverReq() && newProgress >= streakAchievement.getSilverReq();
        boolean reachedGold = oldProgress < streakAchievement.getGoldReq() && newProgress >= streakAchievement.getGoldReq();

        if (reachedBronze || reachedSilver || reachedGold) {
            newAchievements.add(toAchievementProgressDto(updatedAp, streakAchievement));
        }

        return newAchievements;
    }

    @Override
    public int getCurrentStreak(Long userId) throws InstanceNotFoundException {
        return workoutService.calculateCurrentStreak(userId);
    }

    private Integer findMaxWeightByUser(Long userId, Long excludeWorkoutId) {
        String jpql = "SELECT MAX(we.weight) FROM WorkoutExercise we WHERE we.workout.user.id = :userId";
        if (excludeWorkoutId != null) {
            jpql += " AND we.workout.id != :excludeWorkoutId";
        }
        Query query = entityManager.createQuery(jpql);
        query.setParameter("userId", userId);
        if (excludeWorkoutId != null) {
            query.setParameter("excludeWorkoutId", excludeWorkoutId);
        }
        Short maxWeight = (Short) query.getSingleResult();
        return maxWeight != null ? Integer.valueOf(maxWeight) : 0;
    }

    private Integer calculateMaxWeightForWorkout(Long workoutId) {
        String jpql = "SELECT MAX(we.weight) FROM WorkoutExercise we WHERE we.workout.id = :workoutId";
        Query query = entityManager.createQuery(jpql);
        query.setParameter("workoutId", workoutId);
        Short maxWeight = (Short) query.getSingleResult();
        return maxWeight != null ? Integer.valueOf(maxWeight) : 0;
    }
}
