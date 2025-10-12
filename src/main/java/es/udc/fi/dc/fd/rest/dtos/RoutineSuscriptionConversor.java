package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineSuscription;
import es.udc.fi.dc.fd.model.entities.User;

import java.util.List;
import java.util.Map;

public class RoutineSuscriptionConversor {
    private RoutineSuscriptionConversor() {}

    public static List<RoutineSuscriptionDto> toRoutineSuscriptionDto(Map<Routine, List<User>> map) {
        return map.entrySet().stream()
                .map(entry -> new RoutineSuscriptionDto(
                        entry.getKey().getId(),
                        entry.getKey().getName(),
                        entry.getValue().stream()
                                .map(u -> new UserSummaryDto(u.getId(), u.getName()))
                                .toList()
                ))
                .toList();
    }
}
