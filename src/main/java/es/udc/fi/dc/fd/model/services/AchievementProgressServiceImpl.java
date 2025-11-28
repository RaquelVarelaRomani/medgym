package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
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

    public AchievementProgressServiceImpl(UserDao userDao, AchievementDao achievementDao, AchievementProgressDao achievementProgressDao) {
        this.userDao = userDao;
        this.achievementDao = achievementDao;
        this.achievementProgressDao = achievementProgressDao;
    }

    @Override
    public void createOrUpdateAchievementProgress(Long userId, Long achievementId, Integer progressAdded) throws InstanceNotFoundException {

        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        Achievement achievement = achievementDao.findById(achievementId).orElseThrow(() -> new InstanceNotFoundException("project.entities.achievement", achievementId));
        AchievementProgress achievementProgress = findAchievementProgress(userId, achievementId);

        if (achievementProgress == null) {
            achievementProgressDao.save(new AchievementProgress(progressAdded, user, achievement));
        } else {
            achievementProgress.setProgress(achievementProgress.getProgress() + progressAdded);
        }
    }

    @Override
    public void onFinishedWorkout(Long userId, Integer seconds, Integer reps) throws InstanceNotFoundException {
        createOrUpdateAchievementProgress(userId, 1L, seconds);
        createOrUpdateAchievementProgress(userId, 2L, reps);
        createOrUpdateAchievementProgress(userId, 3L, 1);
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
                    createOrUpdateAchievementProgress(userId, achievementId, 0);
                }
            }

            return achievementProgressDao.findByUserId(userId);
        }

        return achievementProgresses;
    }
}
