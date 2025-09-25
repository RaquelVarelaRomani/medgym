
package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;

import java.util.List;
import java.util.stream.Collectors;

public class ExerciseConversor {

    private ExerciseConversor() {}

    public static final ExerciseDto toExerciseDto(Exercise exercise) {
        return new ExerciseDto(exercise.getId(), exercise.getName(), exercise.getDescription());
    }

    public static final Exercise toExercise(ExerciseDto exerciseDto) {
        return new Exercise(exerciseDto.getName(), exerciseDto.getDescription());
    }

    public static final List<ExerciseDto> toExerciseDtos(List<Exercise> exercises) {
        return exercises.stream().map(e -> toExerciseDto(e)).collect(Collectors.toList());
    }
}
