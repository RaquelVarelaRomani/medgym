package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.RoutineExerciseService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.ExerciseTypeDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.ExerciseTypeConversor.toExerciseTypeDtos;
import static es.udc.fi.dc.fd.rest.dtos.RoutineExerciseConversor.toRoutineExerciseDto;

@RestController
@RequestMapping("/api")
public class RoutineExerciseController {
    private final RoutineExerciseService routineExerciseService;

    public RoutineExerciseController(RoutineExerciseService routineExerciseService) {
        this.routineExerciseService = routineExerciseService;
    }

    @PostMapping("/routines/{routineId}/exercises")
    public RoutineExerciseDto addRoutineExercise(@RequestAttribute Long userId,
                                                 @PathVariable Long routineId, @RequestBody RoutineExerciseDto params)
            throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        return toRoutineExerciseDto(routineExerciseService.addExerciseToRoutine(userId, routineId, params.getExerciseId(), RoutineExercise.ExerciseType.valueOf(params.getExerciseType()),
                params.getPosition()));
    }

    @DeleteMapping("/routines/{routineId}/exercises/{exerciseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeExerciseForRoutine(@PathVariable Long routineId, @PathVariable Long exerciseId, @RequestAttribute Long userId)
            throws PermissionException, InstanceNotFoundException {
        routineExerciseService.removeExerciseFromRoutine(userId, routineId, exerciseId);
    }

    @PutMapping("/routines/{routineId}/exercises/{exerciseId}")
    public RoutineExerciseDto updateRoutineExercise(@RequestAttribute Long userId, @PathVariable Long routineId, @PathVariable Long exerciseId, @RequestBody RoutineExerciseDto params)
            throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        return toRoutineExerciseDto(routineExerciseService.updateExerciseInRoutine(userId, routineId, exerciseId,
                RoutineExercise.ExerciseType.valueOf(params.getExerciseType()), params.getPosition()));
    }

    @GetMapping("/routines/{routineId}/exercises")
    public Page<RoutineExerciseDto> getExercisesForRoutines(
            @PathVariable Long routineId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Page<RoutineExercise> routineExercisePage = routineExerciseService.getExercisesForRoutines(routineId, PageRequest.of(page, size));
        return routineExercisePage.map(RoutineExerciseConversor::toRoutineExerciseDto);
    }

    @GetMapping("/exerciseTypes")
    public List<ExerciseTypeDto> findAllExerciseTypes() {
        return toExerciseTypeDtos(routineExerciseService.findAllExerciseTypes());
    }
}
