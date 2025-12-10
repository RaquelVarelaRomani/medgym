package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementProgressDao extends JpaRepository<AchievementProgress, Long> {
    AchievementProgress findByUserIdAndAchievementId(Long userId, Long achievementId);

    List<AchievementProgress> findByUserId(Long userId);
}
