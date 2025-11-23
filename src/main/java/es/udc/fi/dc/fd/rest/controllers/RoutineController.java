
package es.udc.fi.dc.fd.rest.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import static es.udc.fi.dc.fd.rest.dtos.RoutineConversor.toRoutineDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {
    private final RoutineService routineService;
    private final UserService userService;

    public RoutineController(RoutineService routineService, UserService userService) {
        this.routineService = routineService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<RoutineDto> createRoutine(@RequestAttribute Long userId, @RequestBody RoutineDto routineDto) throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = userService.loginFromId(userId);
        Routine.DifficultyType difficulty = routineDto.getDifficulty() != null ? Routine.DifficultyType.valueOf(routineDto.getDifficulty().toUpperCase()) : Routine.DifficultyType.BEGINNER;
        Routine routine = routineService.createRoutine(routineDto.getName(), routineDto.getDescription(), user,
                Routine.VisibilityType.valueOf(routineDto.getVisibility()), difficulty);
        URI location = URI.create("/api/routines/" + routine.getId());
        return ResponseEntity.created(location).body(toRoutineDto(routine));
    }

    @GetMapping("/{id}")
    public RoutineDto getRoutine(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException {
        return toRoutineDto(routineService.findRoutineByIdAuth(userId, id));
    }

    @PutMapping("/{id}")
    public RoutineDto updateRoutine(@RequestAttribute Long userId, @PathVariable Long id, @RequestBody RoutineDto routineDto)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        Routine.DifficultyType difficulty = routineDto.getDifficulty() != null ? Routine.DifficultyType.valueOf(routineDto.getDifficulty().toUpperCase()) : Routine.DifficultyType.BEGINNER;
        routineService.updateRoutine(userId, id, routineDto.getName(), routineDto.getDescription(),
                Routine.VisibilityType.valueOf(routineDto.getVisibility()), difficulty);
        return toRoutineDto(routineService.findRoutineByIdAuth(userId,id));
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
                                                  @RequestParam(required = false) String equipment,
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
        return RoutineConversor.toRoutineDtos(routineService.findRoutinesByFilters(userId, equipment, muscleGroup, difficultyType, trainerId));
    }
}
