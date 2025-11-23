package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.RoutineLikeService;
import es.udc.fi.dc.fd.rest.dtos.RoutineLikeDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.RoutineLikeConversor.toRoutineLikeDtos;

@RestController
@RequestMapping("/api")
public class RoutineLikeController {

    private final RoutineLikeService routineLikeService;

    public RoutineLikeController(RoutineLikeService routineLikeService) {
        this.routineLikeService = routineLikeService;
    }

    @PostMapping("/routines/{routineId}/like")
    public void likeRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        routineLikeService.likeRoutine(userId, routineId);
    }

    @GetMapping("/routineLikes")
    public List<RoutineLikeDto> getRoutineLikesByUser(@RequestAttribute Long userId) {
        return toRoutineLikeDtos(routineLikeService.getRoutineLikesByUser(userId));
    }

    @DeleteMapping("/routines/{routineId}/unlike")
    public void unlikeRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) {
        routineLikeService.unlikeRoutine(userId, routineId);
    }

}
