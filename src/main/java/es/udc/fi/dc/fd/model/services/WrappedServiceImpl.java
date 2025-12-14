package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Routine;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WrappedServiceImpl implements WrappedService {
    @Override
    public List<Exercise> getTopExercisesByUser(Long userId) {
        return List.of();
    }

    @Override
    public String getFavouriteMuscleGroup(Long userId) {
        return "";
    }

    @Override
    public Routine getFavouriteRoutine(Long userId) {
        return null;
    }
}
