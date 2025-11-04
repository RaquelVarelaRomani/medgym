package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;

import java.util.List;
import java.util.stream.Collectors;

public class RoutineExerciseConversor {
    private RoutineExerciseConversor() {}

    public static final RoutineExerciseDto toRoutineExerciseDto(RoutineExercise routineExercise) {
        Exercise ex = routineExercise.getExercise();
        boolean blocked = (ex != null && ex.getStatus() == ExerciseStatus.BLOCKED);
        
         return new RoutineExerciseDto(
                routineExercise.getId(),
                routineExercise.getRoutine().getId(),
                ex != null ? ex.getId() : null,
                ex != null ? ex.getName() : null,
                ex != null ? ex.getDescription() : null,
                routineExercise.getPosition(),
                blocked
        );
    }

    public static final List<RoutineExerciseDto> toRoutineExercisesDtos(List<RoutineExercise> routineExercises) {
        return routineExercises.stream()
                .map(RoutineExerciseConversor::toRoutineExerciseDto)
                .collect(Collectors.toList());
    }
}