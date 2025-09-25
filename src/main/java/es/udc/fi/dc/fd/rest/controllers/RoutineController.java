
package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.RoutineConversor.toRoutineDto;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<RoutineDto> createRoutine(@RequestAttribute Long userId, @RequestBody RoutineDto routineDto) throws DuplicateInstanceException, InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        Routine routine = routineService.createRoutine(routineDto.getName(), routineDto.getDescription(), user);
        URI location = URI.create("/api/routines/" + routine.getId());
        return ResponseEntity.created(location).body(toRoutineDto(routine));
    }

    @GetMapping("/{id}")
    public RoutineDto getRoutine(@PathVariable Long id) throws InstanceNotFoundException {
        return toRoutineDto(routineService.findRoutineById(id));
    }

    @PutMapping("/{id}")
    public RoutineDto updateRoutine(@RequestAttribute Long userId, @PathVariable Long id, @RequestBody RoutineDto routineDto) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        routineService.updateRoutine(userId, id, routineDto.getName(), routineDto.getDescription());
        return toRoutineDto(routineService.findRoutineById(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoutine(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException, PermissionException {
        routineService.deleteRoutine(userId, id);
    }

    @GetMapping
    public List<RoutineDto> findAllRoutines() {
        return RoutineConversor.toRoutineDtos(routineService.findAllRoutines());
    }

}
