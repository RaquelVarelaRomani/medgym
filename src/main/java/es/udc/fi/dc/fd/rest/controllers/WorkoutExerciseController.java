package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import es.udc.fi.dc.fd.model.services.WorkoutExerciseService;
import es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseConversor.toWorkoutExerciseDto;
import static es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseConversor.toWorkoutExerciseDtos;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutExerciseController {

    @Autowired
    private WorkoutExerciseService workoutExerciseService;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

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
