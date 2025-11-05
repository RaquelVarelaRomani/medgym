package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;

public class MuscleGroupConversor {

    private MuscleGroupConversor() {}

    public static MuscleGroupDto toMuscleGroupDto(MuscleGroup muscleGroup) {

        return new MuscleGroupDto(
                muscleGroup.name()
        );
    }

    public static List<MuscleGroupDto> toMuscleGroupDtos(List<MuscleGroup> muscleGroups) {
        return muscleGroups.stream().map(MuscleGroupConversor::toMuscleGroupDto).toList();
    }
}
