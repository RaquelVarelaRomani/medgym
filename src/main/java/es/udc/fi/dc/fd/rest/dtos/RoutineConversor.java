
package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;
import java.util.stream.Collectors;

import static es.udc.fi.dc.fd.rest.dtos.RoutineLikeConversor.toRoutineLikeDtos;

public class RoutineConversor {

    private RoutineConversor() {}

    public static RoutineDto toRoutineDto(Routine routine) {

        RoutineDto routineDto = new RoutineDto();

        routineDto.setId(routine.getId());
        routineDto.setName(routine.getName());
        routineDto.setDescription(routine.getDescription());
        routineDto.setCreationDate(routine.getCreationDate());
        routineDto.setModificationDate(routine.getModificationDate());
        routineDto.setTrainerId(routine.getTrainer().getId());
        routineDto.setTrainerName(routine.getTrainer().getName());
        routineDto.setTrainerSurname(routine.getTrainer().getSurname());
        routineDto.setVisibility(routine.getVisibility().toString());
        routineDto.setDifficulty(routine.getDifficulty() != null ? routine.getDifficulty().toString() : null);
        routineDto.setLikes(toRoutineLikeDtos(routine.getRoutineLikes() != null ? routine.getRoutineLikes() : List.of()));

        return routineDto;
    }

    public static List<RoutineDto> toRoutineDtos(List<Routine> routines) {
        return routines.stream().map(RoutineConversor::toRoutineDto).collect(Collectors.toList());
    }
}
