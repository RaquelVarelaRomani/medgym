
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
        Routine routine = routineService.createRoutine(routineDto.getName(), routineDto.getDescription(), user,
                Routine.VisibilityType.valueOf(routineDto.getVisibility()));
        URI location = URI.create("/api/routines/" + routine.getId());
        return ResponseEntity.created(location).body(toRoutineDto(routine));
    }

    @GetMapping("/{id}")
    public RoutineDto getRoutine(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException {
        return toRoutineDto(routineService.findRoutineById(userId, id));
    }

    @PutMapping("/{id}")
    public RoutineDto updateRoutine(@RequestAttribute Long userId, @PathVariable Long id, @RequestBody RoutineDto routineDto)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        routineService.updateRoutine(userId, id, routineDto.getName(), routineDto.getDescription(),
                Routine.VisibilityType.valueOf(routineDto.getVisibility()));
        return toRoutineDto(routineService.findRoutineById(userId,id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoutine(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException, PermissionException {
        routineService.deleteRoutine(userId, id);
    }

    @GetMapping
    public List<RoutineDto> findAllRoutines(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return RoutineConversor.toRoutineDtos(routineService.findAllRoutines(userId));
    }

    @GetMapping("/filter")
    public List<RoutineDto> findRoutinesByFilters(@RequestAttribute Long userId,
                                                  @RequestParam(required = false) String muscleGroup,
                                                  @RequestParam(required = false) String difficulty,
                                                  @RequestParam(required = false) Long trainerId) throws InstanceNotFoundException {
        Routine.DifficultyType difficultyType = null;
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            try {
                difficultyType = Routine.DifficultyType.valueOf(difficulty.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid difficulty, ignore filter
            }
        }
        return RoutineConversor.toRoutineDtos(routineService.findRoutinesByFilters(userId, muscleGroup, difficultyType, trainerId));
    }
}
