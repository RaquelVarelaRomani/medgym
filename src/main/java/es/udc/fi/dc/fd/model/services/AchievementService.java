package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Achievement;

import java.util.List;

public interface AchievementService {
    Achievement findAchievementById(Long achievementId) throws InstanceNotFoundException;
    List<Achievement> findAllAchievements();
}
