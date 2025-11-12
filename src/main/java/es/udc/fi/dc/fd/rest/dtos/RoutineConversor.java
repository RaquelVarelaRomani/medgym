
package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;
import java.util.stream.Collectors;

import static es.udc.fi.dc.fd.rest.dtos.RoutineLikeConversor.toRoutineLikeDtos;

public class RoutineConversor {

    private RoutineConversor() {}

    public static RoutineDto toRoutineDto(Routine routine) {
        return new RoutineDto(routine.getId(), routine.getName(), routine.getDescription(), routine.getCreationDate(),
                routine.getModificationDate(), routine.getTrainer().getId(), routine.getTrainer().getName(),
                routine.getTrainer().getSurname(), routine.getVisibility().toString(),
                routine.getDifficulty() != null ? routine.getDifficulty().toString() : null,
                toRoutineLikeDtos(routine.getRoutineLikes() != null ? routine.getRoutineLikes() : List.of()));
    }

    public static List<RoutineDto> toRoutineDtos(List<Routine> routines) {
        return routines.stream().map(RoutineConversor::toRoutineDto).collect(Collectors.toList());
    }
}
