
package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;
import java.util.stream.Collectors;

public class RoutineConversor {

    private RoutineConversor() {}

    public static final RoutineDto toRoutineDto(Routine routine) {
        return new RoutineDto(routine.getId(), routine.getName(), routine.getDescription(), routine.getCreationDate(),
                routine.getModificationDate(), routine.getTrainer().getId(), routine.getTrainer().getName(),
                routine.getTrainer().getSurname(), routine.getVisibility().toString(),
                routine.getDifficulty() != null ? routine.getDifficulty().toString() : null);
    }

    public static final List<RoutineDto> toRoutineDtos(List<Routine> routines) {
        return routines.stream().map(r -> toRoutineDto(r)).collect(Collectors.toList());
    }
}
