package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;

import java.util.List;
import java.util.stream.Collectors;

public class ExerciseConversor {

    private ExerciseConversor() {}

    public static ExerciseDto toExerciseDto(Exercise exercise) {

        ExerciseDto exerciseDto = new ExerciseDto();

        exerciseDto.setId(exercise.getId());
        exerciseDto.setName(exercise.getName());
        exerciseDto.setDescription(exercise.getDescription());
        exerciseDto.setMuscleGroup(exercise.getMuscleGroup().toString());
        exerciseDto.setEquipment(exercise.getEquipment().toString());
        exerciseDto.setImage(exercise.getImage());
        exerciseDto.setStatus(exercise.getStatus().toString());
        exerciseDto.setCreatorId(exercise.getCreator() != null ? exercise.getCreator().getId() : null);

        return exerciseDto;
    }

    public static List<ExerciseDto> toExerciseDtos(List<Exercise> exercises) {
        return exercises.stream().map(ExerciseConversor::toExerciseDto).collect(Collectors.toList());
    }
}
