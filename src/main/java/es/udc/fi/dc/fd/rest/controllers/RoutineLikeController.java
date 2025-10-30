package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.RoutineLikeService;
import es.udc.fi.dc.fd.rest.dtos.RoutineLikeDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static es.udc.fi.dc.fd.rest.dtos.RoutineLikeConversor.toRoutineLikeDtos;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoutineLikeController {

    @Autowired
    private RoutineLikeService routineLikeService;

    @PostMapping("/routines/{routineId}/like")
    public void likeRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        routineLikeService.likeRoutine(userId, routineId);
    }

    @PostMapping("/routines/{routineId}/like")
    public void saveRoutine(@RequestAttribute Long userId, @PathVariable Long routineId) throws InstanceNotFoundException {
        if (userId == 0) {
            ResponseEntity.ok("wrong id");
        }
        routineLikeService.likeRoutine(userId, routineId);
    }

    @GetMapping("/routineLikes")
    public List<RoutineLikeDto> getLikesByUser(@RequestAttribute Long userId) {
        return toRoutineLikeDtos(routineLikeService.getLikesByUser(userId));
    }

    @DeleteMapping("/routines/{routineId}/unlike")
    public void deleteLike(@RequestAttribute Long userId, @PathVariable Long routineId) {
        routineLikeService.unlikeRoutine(userId, routineId);
    }

}
