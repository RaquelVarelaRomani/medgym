package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;

import java.util.List;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;

public class ExerciseTypeConversor {

    private ExerciseTypeConversor() {
    }

    public static ExerciseTypeDto toExerciseTypeDto(Exercise.ExerciseType exerciseType) {

        return new ExerciseTypeDto(
                exerciseType.name()
        );
    }

    public static List<ExerciseTypeDto> toExerciseTypeDtos(List<Exercise.ExerciseType> exerciseTypes) {
        return exerciseTypes.stream().map(ExerciseTypeConversor::toExerciseTypeDto).toList();
    }
}
