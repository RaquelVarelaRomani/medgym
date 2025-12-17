package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.RoutineExercise;

import java.util.List;

public class ExerciseTypeConversor {

    private ExerciseTypeConversor() {
    }

    public static ExerciseTypeDto toExerciseTypeDto(RoutineExercise.ExerciseType exerciseType) {

        return new ExerciseTypeDto(
                exerciseType.name()
        );
    }

    public static List<ExerciseTypeDto> toExerciseTypeDtos(List<RoutineExercise.ExerciseType> exerciseTypes) {
        return exerciseTypes.stream().map(ExerciseTypeConversor::toExerciseTypeDto).toList();
    }
}