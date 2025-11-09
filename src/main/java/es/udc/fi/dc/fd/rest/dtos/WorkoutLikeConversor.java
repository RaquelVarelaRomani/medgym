package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.WorkoutLike;

import java.util.List;

public class WorkoutLikeConversor {

    private WorkoutLikeConversor() {}

    public static WorkoutLikeDto toWorkoutLikeDto(WorkoutLike workoutLike) {
        return new WorkoutLikeDto(
                workoutLike.getId(),
                workoutLike.getUser().getId(),
                workoutLike.getWorkout().getId()
        );
    }

    public static List<WorkoutLikeDto> toWorkoutLikeDtos(List<WorkoutLike> workoutLikes) {
        return workoutLikes.stream().map(WorkoutLikeConversor::toWorkoutLikeDto).toList();
    }
}
