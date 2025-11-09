package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Workout;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutCommentConversor.toWorkoutCommentDtos;

public class WorkoutConversor {

    private WorkoutConversor() {
    }

    public static WorkoutDto toWorkoutDto(Workout workout) {
        return new WorkoutDto(
                workout.getId(),
                workout.getStartTime(),
                workout.getEndTime(),
                workout.getRoutine().getId(),
                workout.getRoutine().getName(),
                workout.getUser().getId()
        );
    }

    public static WorkoutForFeedDto toWorkoutForFeedDto(Workout workout) {
        return new WorkoutForFeedDto(
                workout.getId(),
                workout.getStartTime(),
                workout.getEndTime(),
                workout.getRoutine().getId(),
                workout.getRoutine().getName(),
                workout.getUser().getId(),
                workout.getUser().getName(),
                workout.getUser().getSurname(),
                workout.getUser().getProfilePicture(),
                toWorkoutCommentDtos(workout.getComments())
        );
    }

    public static List<WorkoutDto> toWorkoutDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutDto).toList();
    }

    public static List<WorkoutForFeedDto> toWorkoutForFeedDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutForFeedDto).toList();
    }

}
