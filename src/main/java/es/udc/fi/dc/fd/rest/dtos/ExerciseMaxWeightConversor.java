package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeight;

import java.util.List;

public final class ExerciseMaxWeightConversor {

    private ExerciseMaxWeightConversor() {
    }

    public static ExerciseMaxWeightDto toExerciseMaxWeightDto(ExerciseMaxWeight e) {
        return new ExerciseMaxWeightDto(
                e.getId(),
                e.getUser().getId(),
                e.getUser().getName(),
                e.getUser().getSurname(),
                e.getUser().getProfilePicture(),
                e.getMaxWeightKg()
        );
    }

    public static List<ExerciseMaxWeightDto> toExerciseMaxWeightDtos(List<ExerciseMaxWeight> list) {
        return list.stream()
                .map(ExerciseMaxWeightConversor::toExerciseMaxWeightDto)
                .toList();
    }
}
