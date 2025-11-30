package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.WorkoutLikeService;
import es.udc.fi.dc.fd.rest.dtos.WorkoutLikeDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutLikeConversor.toWorkoutLikeDtos;

@RestController
@RequestMapping("/api")
public class WorkoutLikeController {
    private final WorkoutLikeService workoutLikeService;

    public WorkoutLikeController(WorkoutLikeService workoutLikeService) {
        this.workoutLikeService = workoutLikeService;
    }

    @PostMapping("/workouts/{workoutId}/like")
    public void likeWorkout(@RequestAttribute Long userId, @PathVariable Long workoutId) throws InstanceNotFoundException {
        workoutLikeService.likeWorkout(
                userId,
                workoutId
        );
    }

    @GetMapping("/workoutLikes")
    public List<WorkoutLikeDto> getWorkoutLikesByUser(@RequestAttribute Long userId) {
        return toWorkoutLikeDtos(workoutLikeService.getLikesByUser(userId));
    }

    @DeleteMapping("/workouts/{workoutId}/unlike")
    public void unlikeWorkout(@RequestAttribute Long userId, @PathVariable Long workoutId) {
        workoutLikeService.unlikeWorkout(userId, workoutId);
    }
}
