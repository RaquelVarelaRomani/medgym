package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.rest.dtos.ExerciseStatsDto;

import java.util.List;

public interface ExerciseStatsService {

    List<ExerciseStatsDto> getExerciseStats(Long exerciseId) throws InstanceNotFoundException;

}