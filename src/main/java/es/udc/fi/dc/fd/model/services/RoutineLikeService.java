package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineLike;

import java.util.List;

public interface RoutineLikeService {
    void likeRoutine(Long userId, Long routineId) throws InstanceNotFoundException;
    List<RoutineLike> getRoutineLikesByUser(Long userId);
    void unlikeRoutine(Long userId, Long routineId);
}
