package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.WrappedService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wrapped")
public class WrappedController {
    private final WrappedService wrappedService;

    public WrappedController(WrappedService wrappedService) {
        this.wrappedService = wrappedService;
    }

    @GetMapping("/topexercises")
    public List<ExerciseDto> getTopExercises(@RequestAttribute Long userId) {
        return ExerciseConversor.toExerciseDtos(this.wrappedService.getTopExercisesByUser(userId));
    }

    @GetMapping("/musclegroup")
    public String getMusclegroup(@RequestAttribute Long userId) {
        return this.wrappedService.getFavouriteMuscleGroup(userId);
    }

    @GetMapping("/routine")
    public RoutineDto getRoutine(@RequestAttribute Long userId) {
        return RoutineConversor.toRoutineDto(this.wrappedService.getFavouriteRoutine(userId));
    }
}
