package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeight;

import java.util.List;

public interface ExerciseMaxWeightService {
    void addOrUpdateMaxWeight(Long userId, Long exerciseId, Short maxWeightKg) throws InstanceNotFoundException;
    List<ExerciseMaxWeight> getMaxWeightRanking(Long userId, Long exerciseId) throws InstanceNotFoundException;
}
