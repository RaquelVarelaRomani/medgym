package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.WrappedService;
import es.udc.fi.dc.fd.rest.dtos.FavouriteRoutineConversor;
import es.udc.fi.dc.fd.rest.dtos.FavouriteRoutineDto;
import es.udc.fi.dc.fd.rest.dtos.MuscleGroupFavouriteDto;
import es.udc.fi.dc.fd.rest.dtos.TopExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.TopExerciseDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
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
    public List<TopExerciseDto> getTopExercises(@RequestAttribute Long userId) {
        return TopExerciseConversor.toTopExerciseDtos(this.wrappedService.getTopExercisesByUser(userId));
    }

    @GetMapping("/musclegroup")
    public MuscleGroupFavouriteDto getMusclegroup(@RequestAttribute Long userId) {
        return new MuscleGroupFavouriteDto(this.wrappedService.getFavouriteMuscleGroup(userId));
    }

    @GetMapping("/routine")
    public FavouriteRoutineDto getRoutine(@RequestAttribute Long userId) {
        Map.Entry<es.udc.fi.dc.fd.model.entities.Routine, Long> result = this.wrappedService.getFavouriteRoutine(userId);
        if (result == null) {
            return null;
        }
        return FavouriteRoutineConversor.toFavouriteRoutineDto(result.getKey(), result.getValue());
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
