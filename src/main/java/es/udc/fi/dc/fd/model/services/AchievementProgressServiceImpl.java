package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AchievementProgressServiceImpl implements AchievementProgressService {

    private final UserDao userDao;
    private final AchievementDao achievementDao;
    private final AchievementProgressDao achievementProgressDao;

    private static final String PROJECT_ENTITIES_USER = "entities.user";
    private static final String PROJECT_ENTITIES_ACHIEVEMENT = "entities.achievement";

    private static final Long HOURS_ACHIEVEMENT_ID = 1L;
    private static final Long REPS_ACHIEVEMENT_ID = 2L;
    private static final Long WORKOUTS_ACHIEVEMENT_ID = 3L;
    private static final Long MAX_WEIGHT_ACHIEVEMENT_ID = 4L;

    private static final Integer NO_PROGRESS = 0;

    public AchievementProgressServiceImpl(UserDao userDao, AchievementDao achievementDao, AchievementProgressDao achievementProgressDao) {
        this.userDao = userDao;
        this.achievementDao = achievementDao;
        this.achievementProgressDao = achievementProgressDao;
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
    public void onFinishedWorkout(Long userId, Integer seconds, Integer reps) throws InstanceNotFoundException {
        createOrUpdateAchievementProgress(userId, HOURS_ACHIEVEMENT_ID, seconds);
        createOrUpdateAchievementProgress(userId, REPS_ACHIEVEMENT_ID, reps);
        createOrUpdateAchievementProgress(userId, WORKOUTS_ACHIEVEMENT_ID, 1);
    }

    @Override
    public void maxWeightWorkout(Long userId, Short maxWeight) throws InstanceNotFoundException {
        createOrUpdateAchievementProgress(userId, MAX_WEIGHT_ACHIEVEMENT_ID, 1);
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
}
