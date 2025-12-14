package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;

public interface WrappedService {
    List<Exercise> getTopExercisesByUser(Long userId);
    String getFavouriteMuscleGroup(Long userId);
    Routine getFavouriteRoutine(Long userId);
}
