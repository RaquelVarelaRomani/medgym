package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.WorkoutExerciseService;
import es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseConversor.toWorkoutExerciseDto;
import static es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseConversor.toWorkoutExerciseDtos;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutExerciseController {
    private final WorkoutExerciseService workoutExerciseService;

    public WorkoutExerciseController(WorkoutExerciseService workoutExerciseService) {
        this.workoutExerciseService = workoutExerciseService;
    }

    @PostMapping("/{workoutId}/log")
    public WorkoutExerciseDto addWorkoutExercise(@PathVariable Long workoutId, @RequestBody WorkoutExerciseDto workoutExerciseDto) throws InstanceNotFoundException {
        return toWorkoutExerciseDto(workoutExerciseService.addWorkoutExercise(
                workoutExerciseDto.getReps(),
                workoutExerciseDto.getWeight(),
                workoutExerciseDto.getDurationSeconds(),
                workoutId,
                workoutExerciseDto.getRoutineExerciseId()
        ));
    }

    @GetMapping("/{workoutId}/log")
    public List<WorkoutExerciseDto> getWorkoutExercisesByWorkoutId(@PathVariable Long workoutId) throws InstanceNotFoundException {
        return toWorkoutExerciseDtos(workoutExerciseService.findWorkoutExercisesByWorkoutId(workoutId));
    }
}
