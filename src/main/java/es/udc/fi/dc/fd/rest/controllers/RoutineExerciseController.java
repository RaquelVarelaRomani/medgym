package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.RoutineExerciseService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineExerciseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import static es.udc.fi.dc.fd.rest.dtos.RoutineExerciseConversor.toRoutineExerciseDto;

@RestController
@RequestMapping("/api/routines/{routineId}/exercises")
public class RoutineExerciseController {
    @Autowired
    private RoutineExerciseService routineExerciseService;

    @PostMapping("")
    public RoutineExerciseDto addRoutineExercise(@RequestAttribute Long userId,
                                                 @PathVariable Long routineId, @RequestBody RoutineExerciseDto params)
            throws PermissionException, InstanceNotFoundException {
        return toRoutineExerciseDto(routineExerciseService.addExerciseToRoutine(userId, routineId, params.getExerciseId(),
                params.getDescription()));
    }

    @PutMapping("/{exerciseId}")
    public RoutineExerciseDto updateRoutineExercise(
            @PathVariable Long routineId, @PathVariable Long exerciseId, @RequestAttribute Long userId, @RequestBody RoutineExerciseDto params)
            throws PermissionException, InstanceNotFoundException {
        return toRoutineExerciseDto(routineExerciseService.updateExerciseOnRoutine(userId, routineId, exerciseId, params.getDescription()));
    }

    @DeleteMapping("/{exerciseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeExerciseForRoutine(@PathVariable Long routineId, @PathVariable Long exerciseId, @RequestAttribute Long userId)
            throws PermissionException, InstanceNotFoundException {
        routineExerciseService.removeExerciseFromRoutine(userId, routineId, exerciseId);
    }

    @GetMapping("")
    public Page<RoutineExerciseDto> getExercisesForRoutines(
            @PathVariable Long routineId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Page<RoutineExercise> routineExercisePage = routineExerciseService.getExercisesForRoutines(routineId, PageRequest.of(page, size));
        return routineExercisePage.map(RoutineExerciseConversor::toRoutineExerciseDto);
    }
}
