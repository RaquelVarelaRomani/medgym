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
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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

    @GetMapping("/weight-comparison")
    public WeightComparisonDto getWeightComparison(
            @RequestAttribute Long userId,
            @RequestParam(required = false) Integer year) throws InstanceNotFoundException {

        int targetYear = (year != null) ? year : LocalDateTime.now().getYear();

        return wrappedService.getWeightComparison(userId, targetYear);
    }

    @GetMapping("/longest-streak")
    public Integer getLongestStreak(
            @RequestAttribute Long userId,
            @RequestParam(required = false) Integer year) throws InstanceNotFoundException {

        int targetYear = (year != null) ? year : LocalDateTime.now().getYear();

        return wrappedService.getLongestStreak(userId, targetYear);
    }
}
