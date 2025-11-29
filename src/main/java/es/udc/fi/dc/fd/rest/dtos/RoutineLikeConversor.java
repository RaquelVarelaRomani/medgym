package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.RoutineLike;

import java.util.List;

public class RoutineLikeConversor {

    private RoutineLikeConversor() {
    }

    public static final RoutineLikeDto toRoutineLikeDto(RoutineLike routineLike) {
        return new RoutineLikeDto(
                routineLike.getId(),
                routineLike.getUser().getId(),
                routineLike.getRoutine().getId()
        );
    }

    public static final List<RoutineLikeDto> toRoutineLikeDtos(List<RoutineLike> routineLikes) {
        return routineLikes.stream().map(RoutineLikeConversor::toRoutineLikeDto).toList();
    }
}
