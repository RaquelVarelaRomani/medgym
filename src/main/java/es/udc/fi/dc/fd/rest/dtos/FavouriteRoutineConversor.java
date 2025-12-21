package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.RoutineLikeConversor.toRoutineLikeDtos;

public class FavouriteRoutineConversor {

    private FavouriteRoutineConversor() {
    }

    public static FavouriteRoutineDto toFavouriteRoutineDto(Routine routine, Long count) {
        if (routine == null) {
            return null;
        }
        FavouriteRoutineDto dto = new FavouriteRoutineDto();
        dto.setId(routine.getId());
        dto.setName(routine.getName());
        dto.setDescription(routine.getDescription());
        dto.setCreationDate(routine.getCreationDate());
        dto.setModificationDate(routine.getModificationDate());
        dto.setTrainerId(routine.getTrainer() != null ? routine.getTrainer().getId() : null);
        dto.setTrainerName(routine.getTrainer() != null ? routine.getTrainer().getName() : null);
        dto.setTrainerSurname(routine.getTrainer() != null ? routine.getTrainer().getSurname() : null);
        dto.setVisibility(routine.getVisibility() != null ? routine.getVisibility().toString() : null);
        dto.setDifficulty(routine.getDifficulty() != null ? routine.getDifficulty().toString() : null);
        dto.setLikes(toRoutineLikeDtos(routine.getRoutineLikes() != null ? routine.getRoutineLikes() : List.of()));
        dto.setCount(count);
        return dto;
    }
}
