package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Achievement;
import es.udc.fi.dc.fd.model.entities.AchievementDao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementServiceImpl implements AchievementService {
    private final AchievementDao achievementDao;

    public AchievementServiceImpl(AchievementDao achievementDao) {
        this.achievementDao = achievementDao;
    }

    @Override
    public Achievement findAchievementById(Long achievementId) throws InstanceNotFoundException {
        return achievementDao.findById(achievementId).orElseThrow(() -> new InstanceNotFoundException("project.entities.achievement", achievementId));
    }

    @Override
    public List<Achievement> findAllAchievements() {
        return achievementDao.findAll();
    }
}
