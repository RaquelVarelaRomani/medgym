package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.RoutineExercise;

import java.util.List;
import java.util.stream.Collectors;

public class RoutineExerciseConversor {
    private RoutineExerciseConversor() {}

    public static final RoutineExerciseDto toRoutineExerciseDto(RoutineExercise routineExercise) {
        return new RoutineExerciseDto(routineExercise.getId(), routineExercise.getRoutine().getId(),
                routineExercise.getExercise().getId(), routineExercise.getRepetitionsNumber(),
                routineExercise.getDuration());
    }

    public static final List<RoutineExerciseDto> toRoutineExercisesDto(List<RoutineExercise> routineExercises) {
        return routineExercises.stream().map(RoutineExerciseConversor::toRoutineExerciseDto)
                .collect(Collectors.toList());
    }
}
