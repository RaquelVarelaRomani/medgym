package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.WorkoutComment;

import java.util.List;

public class WorkoutCommentConversor {

    private WorkoutCommentConversor() {}

    public static WorkoutCommentDto toWorkoutCommentDto(WorkoutComment workoutComment) {
        return new WorkoutCommentDto(
                workoutComment.getId(),
                workoutComment.getText(),
                workoutComment.getDate(),
                workoutComment.getUser().getId(),
                workoutComment.getWorkout().getId(),
                workoutComment.getUser().getName(),
                workoutComment.getUser().getSurname(),
                workoutComment.getUser().getProfilePicture()
        );
    }

    public static List<WorkoutCommentDto> toWorkoutCommentDtos(List<WorkoutComment> workoutComments) {
        return workoutComments.stream().map(WorkoutCommentConversor::toWorkoutCommentDto).toList();
    }
}
