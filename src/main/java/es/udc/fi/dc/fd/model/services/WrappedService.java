package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;

public interface WrappedService {
    List<Exercise> getTopExercisesByUser(Long userId);
    String getFavouriteMuscleGroup(Long userId);
    Routine getFavouriteRoutine(Long userId);
    Long calculateYearlyTotalWeight(Long userId, int year) throws InstanceNotFoundException;
    WeightComparisonDto getWeightComparison(Long userId, int year) throws InstanceNotFoundException;
}
