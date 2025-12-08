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
    private final WorkoutLikeDao workoutLikeDao;
    private final WorkoutCommentDao workoutCommentDao;
    private final NotificationService notificationService;

    @PersistenceContext
    private EntityManager entityManager;

    private static final String PROJECT_ENTITIES_USER = "entities.user";
    private static final String PROJECT_ENTITIES_ACHIEVEMENT = "entities.achievement";

    private static final Long HOURS_ACHIEVEMENT_ID = 1L;
    private static final Long REPS_ACHIEVEMENT_ID = 2L;
    private static final Long WORKOUTS_ACHIEVEMENT_ID = 3L;
    private static final Long STREAK_ACHIEVEMENT_ID = 4L;
    private static final Long MAX_WEIGHT_ACHIEVEMENT_ID = 5L;
    private static final Long LIKES_ACHIEVEMENT_ID = 6L;
    private static final Long COMMENTS_ACHIEVEMENT_ID = 7L;

    private static final Integer NO_PROGRESS = 0;

    private static final String USER_ID = "userId";

    public AchievementProgressServiceImpl(UserDao userDao, AchievementDao achievementDao, AchievementProgressDao achievementProgressDao, @Lazy WorkoutService workoutService, WorkoutLikeDao workoutLikeDao, WorkoutCommentDao workoutCommentDao, NotificationService notificationService) {
        this.userDao = userDao;
        this.achievementDao = achievementDao;
        this.achievementProgressDao = achievementProgressDao;
        this.workoutService = workoutService;
        this.workoutLikeDao = workoutLikeDao;
        this.workoutCommentDao = workoutCommentDao;
        this.notificationService = notificationService;
    }

    public void setAchievementProgress(Long userId, Long achievementId, Integer progress) throws InstanceNotFoundException {
        AchievementProgress ap = findAchievementProgress(userId, achievementId);
        if (ap == null) {
            User user = userDao.findById(userId)
                            .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, userId));
            Achievement achievement = achievementDao.findById(achievementId)
                            .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ACHIEVEMENT, achievementId));

            achievementProgressDao.save(new AchievementProgress(progress, user, achievement));
        } else {
            ap.setProgress(progress);
            ap.setHighestProgress(Math.max(ap.getHighestProgress(), progress));
        }
    }

    @Override
    public List<AchievementProgressDto> createOrUpdateAchievementProgress(Long userId, Long achievementId, Integer progressAdded) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        AchievementProgress ap = findAchievementProgress(userId, achievementId);
        int oldHighestProgress = (ap != null) ? ap.getHighestProgress() : 0;

        if (ap == null) {
            User user = userDao.findById(userId)
                        .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, userId));
            Achievement achievement = achievementDao.findById(achievementId)
                        .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ACHIEVEMENT, achievementId));

            achievementProgressDao.save(new AchievementProgress(progressAdded, user, achievement));
        } else {
            ap.setProgress(ap.getProgress() + progressAdded);
            ap.setHighestProgress(Math.max(ap.getHighestProgress(), ap.getProgress()));
        }

        AchievementProgress updatedAp = findAchievementProgress(userId, achievementId);
        int newHighestProgress = updatedAp.getHighestProgress();
        Achievement achievement = achievementDao.findById(achievementId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ACHIEVEMENT, achievementId));

        boolean reachedBronze = oldHighestProgress < achievement.getBronzeReq() && newHighestProgress >= achievement.getBronzeReq();
        boolean reachedSilver = oldHighestProgress < achievement.getSilverReq() && newHighestProgress >= achievement.getSilverReq();
        boolean reachedGold = oldHighestProgress < achievement.getGoldReq() && newHighestProgress >= achievement.getGoldReq();

        if (reachedBronze) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Bronce");
            newAchievements.add(dto);
        }
        if (reachedSilver) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Plata");
            newAchievements.add(dto);
        }
        if (reachedGold) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Oro");
            newAchievements.add(dto);
        }

        return newAchievements;
    }

    @Override
    public List<AchievementProgressDto> onFinishedWorkout(Long userId, Integer seconds, Integer reps, Long workoutId) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        newAchievements.addAll(updateAchievementProgress(userId, HOURS_ACHIEVEMENT_ID, seconds));
        newAchievements.addAll(updateAchievementProgress(userId, REPS_ACHIEVEMENT_ID, reps));
        newAchievements.addAll(updateAchievementProgress(userId, WORKOUTS_ACHIEVEMENT_ID, 1));
        newAchievements.addAll(updateMaxWeightAchievements(userId, workoutId));
        newAchievements.addAll(updateStreakAchievements(userId));

        for (AchievementProgressDto dto : newAchievements) {
            String message = "Logro desbloqueado: " + dto.getName() + " (" + dto.getMedalType() + ")";
            try {
                notificationService.createAchievementNotification(userId, message, userId);
            } catch (InstanceNotFoundException e) {
                // User should exist since validated earlier
            }
        }

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
    @Override
    public int getCurrentStreak(Long userId) throws InstanceNotFoundException {
        return workoutService.calculateCurrentStreak(userId);
    }

    public void recalculateAchievementProgressForUser(Long userId) throws InstanceNotFoundException {
        Integer totalHours = calculateTotalHoursForUser(userId);
        setAchievementProgress(userId, HOURS_ACHIEVEMENT_ID, totalHours);

        Integer totalReps = calculateTotalRepsForUser(userId);
        setAchievementProgress(userId, REPS_ACHIEVEMENT_ID, totalReps);

        Integer totalWorkouts = calculateTotalWorkoutsForUser(userId);
        setAchievementProgress(userId, WORKOUTS_ACHIEVEMENT_ID, totalWorkouts);

        Integer currentStreak = workoutService.calculateCurrentStreak(userId);
        setAchievementProgress(userId, STREAK_ACHIEVEMENT_ID, currentStreak);

        Integer maxWeight = calculateMaxWeightForUser(userId);
        setAchievementProgress(userId, MAX_WEIGHT_ACHIEVEMENT_ID, maxWeight);

        Integer totalLikes = countLikesGivenByUser(userId);
        setAchievementProgress(userId, LIKES_ACHIEVEMENT_ID, totalLikes);

        Integer totalComments = countCommentsMadeByUser(userId);
        setAchievementProgress(userId, COMMENTS_ACHIEVEMENT_ID, totalComments);
    }

    private List<AchievementProgressDto> updateAchievementProgress(Long userId, Long achievementId, Integer progressAdded) throws InstanceNotFoundException {
        return createOrUpdateAchievementProgress(userId, achievementId, progressAdded);
    }

    private Integer findMaxWeightByUser(Long userId, Long excludeWorkoutId) {
        String jpql = "SELECT MAX(we.weight) FROM WorkoutExercise we WHERE we.workout.user.id = :" + USER_ID;
        if (excludeWorkoutId != null) {
            jpql += " AND we.workout.id != :excludeWorkoutId";
        }
        Query query = entityManager.createQuery(jpql);
        query.setParameter(USER_ID, userId);
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

    private Integer countLikesGivenByUser(Long userId) {
        return workoutLikeDao.findByUserId(userId).size();
    }

    private Integer countCommentsMadeByUser(Long userId) {
        return workoutCommentDao.findByUserId(userId).size();
    }

    private Integer calculateTotalHoursForUser(Long userId) {
        String jpql = "SELECT SUM(TIMESTAMPDIFF(SECOND, w.startTime, w.endTime)) FROM Workout w WHERE w.user.id = :" + USER_ID + " AND w.endTime IS NOT NULL";
        Query query = entityManager.createQuery(jpql);
        query.setParameter(USER_ID, userId);
        Object result = query.getSingleResult();
        if (result == null) {
            return 0;
        } else {
            Long totalSeconds = ((Number) result).longValue();
            return totalSeconds.intValue();
        }
    }

    private Integer calculateTotalRepsForUser(Long userId) {
        String jpql = "SELECT SUM(we.reps) FROM WorkoutExercise we WHERE we.workout.user.id = :" + USER_ID;
        Query query = entityManager.createQuery(jpql);
        query.setParameter(USER_ID, userId);
        Object result = query.getSingleResult();
        if (result == null) {
            return 0;
        } else {
            Long totalReps = ((Number) result).longValue();
            return totalReps.intValue();
        }
    }

    private Integer calculateTotalWorkoutsForUser(Long userId) {
        String jpql = "SELECT COUNT(w) FROM Workout w WHERE w.user.id = :" + USER_ID + " AND w.endTime IS NOT NULL";
        Query query = entityManager.createQuery(jpql);
        query.setParameter(USER_ID, userId);
        Long count = ((Number) query.getSingleResult()).longValue();
        return count != null ? count.intValue() : 0;
    }

    private Integer calculateMaxWeightForUser(Long userId) {
        String jpql = "SELECT MAX(we.weight) FROM WorkoutExercise we WHERE we.workout.user.id = :" + USER_ID;
        Query query = entityManager.createQuery(jpql);
        query.setParameter(USER_ID, userId);
        Short maxWeight = (Short) query.getSingleResult();
        return maxWeight != null ? Integer.valueOf(maxWeight) : 0;
    }

    private boolean isNewPersonalMaxWeight(Long userId, Long workoutId) {
        Integer currentMaxWeight = calculateMaxWeightForWorkout(workoutId);
        Integer previousMaxWeight = findMaxWeightByUser(userId, workoutId);
        return currentMaxWeight > previousMaxWeight;
    }

    private boolean isTierNewlyReached(int oldHighestProgress, int newHighestProgress, int tierReq) {
        return oldHighestProgress < tierReq && newHighestProgress >= tierReq;
    }

    private List<AchievementProgressDto> updateAchievementProgressAndCheckUnlocks(Long userId, Long achievementId, int newProgress) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        AchievementProgress ap = findAchievementProgress(userId, achievementId);
        int oldHighestProgress = (ap != null) ? ap.getHighestProgress() : 0;
        setAchievementProgress(userId, achievementId, newProgress);
        AchievementProgress updatedAp = findAchievementProgress(userId, achievementId);
        int newHighestProgress = updatedAp.getHighestProgress();
        Achievement achievement = achievementDao.findById(achievementId)
                .orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ACHIEVEMENT, achievementId));
        boolean reachedBronze = isTierNewlyReached(oldHighestProgress, newHighestProgress, achievement.getBronzeReq());
        boolean reachedSilver = isTierNewlyReached(oldHighestProgress, newHighestProgress, achievement.getSilverReq());
        boolean reachedGold = isTierNewlyReached(oldHighestProgress, newHighestProgress, achievement.getGoldReq());
        if (reachedBronze) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Bronce");
            newAchievements.add(dto);
        }
        if (reachedSilver) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Plata");
            newAchievements.add(dto);
        }
        if (reachedGold) {
            AchievementProgressDto dto = toAchievementProgressDto(updatedAp, achievement);
            dto.setMedalType("Oro");
            newAchievements.add(dto);
        }
        return newAchievements;
    }

    private List<AchievementProgressDto> updateStreakAchievements(Long userId) throws InstanceNotFoundException {
        int currentStreak = workoutService.calculateCurrentStreak(userId);
        return updateAchievementProgressAndCheckUnlocks(userId, STREAK_ACHIEVEMENT_ID, currentStreak);
    }

    private List<AchievementProgressDto> updateMaxWeightAchievements(Long userId, Long workoutId) throws InstanceNotFoundException {
        List<AchievementProgressDto> newAchievements = new ArrayList<>();
        if (isNewPersonalMaxWeight(userId, workoutId)) {
            Integer newMaxWeight = calculateMaxWeightForUser(userId);
            newAchievements.addAll(updateAchievementProgressAndCheckUnlocks(userId, MAX_WEIGHT_ACHIEVEMENT_ID, newMaxWeight));
        }
        return newAchievements;
    }
}
