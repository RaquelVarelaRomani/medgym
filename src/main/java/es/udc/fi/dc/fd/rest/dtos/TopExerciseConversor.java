package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;

import java.util.List;
import java.util.Map;

public class TopExerciseConversor {

    private TopExerciseConversor() {
    }

    public static TopExerciseDto toTopExerciseDto(Exercise exercise, Long count) {
        TopExerciseDto dto = new TopExerciseDto();
        dto.setId(exercise.getId());
        dto.setName(exercise.getName());
        dto.setDescription(exercise.getDescription());
        dto.setMuscleGroup(exercise.getMuscleGroup().toString());
        dto.setEquipment(exercise.getEquipment().toString());
        dto.setImage(exercise.getImage());
        dto.setStatus(exercise.getStatus().toString());
        dto.setCreatorId(exercise.getCreator() != null ? exercise.getCreator().getId() : null);
        dto.setCount(count);
        return dto;
    }

    public static List<TopExerciseDto> toTopExerciseDtos(Map<Exercise, Long> exercisesWithCounts) {
        return exercisesWithCounts.entrySet().stream()
                .map(entry -> toTopExerciseDto(entry.getKey(), entry.getValue()))
                .toList();
    }
}
