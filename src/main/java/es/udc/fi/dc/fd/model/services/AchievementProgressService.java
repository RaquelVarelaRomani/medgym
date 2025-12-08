package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.AchievementProgress;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;

import java.util.List;

public interface AchievementProgressService {
    List<AchievementProgressDto> createOrUpdateAchievementProgress(Long userId, Long achievementId, Integer progress) throws InstanceNotFoundException;
    List<AchievementProgressDto> onFinishedWorkout(Long userId, Integer seconds, Integer reps, Long workoutId) throws InstanceNotFoundException;
    AchievementProgress findAchievementProgress(Long userId, Long achievementId);
    List<AchievementProgress> findAchievementProgressesByUser(Long userId) throws InstanceNotFoundException;
    int getCurrentStreak(Long userId) throws InstanceNotFoundException;
    void recalculateAchievementProgressForUser(Long userId) throws InstanceNotFoundException;
}
