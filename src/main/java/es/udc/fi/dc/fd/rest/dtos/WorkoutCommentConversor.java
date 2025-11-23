package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.WorkoutComment;

import java.util.List;

public class WorkoutCommentConversor {

    private WorkoutCommentConversor() {
    }

    public static WorkoutCommentDto toWorkoutCommentDto(WorkoutComment workoutComment) {
        WorkoutCommentDto workoutCommentDto = new WorkoutCommentDto();

        workoutCommentDto.setId(workoutComment.getId());
        workoutCommentDto.setText(workoutComment.getText());
        workoutCommentDto.setDate(workoutComment.getDate());
        workoutCommentDto.setUserId(workoutComment.getUser().getId());
        workoutCommentDto.setWorkoutId(workoutComment.getWorkout().getId());
        workoutCommentDto.setUserName(workoutComment.getUser().getName());
        workoutCommentDto.setUserSurname(workoutComment.getUser().getSurname());
        workoutCommentDto.setUserProfilePicture(workoutComment.getUser().getProfilePicture());

        return workoutCommentDto;
    }

    public static List<WorkoutCommentDto> toWorkoutCommentDtos(List<WorkoutComment> workoutComments) {
        if (workoutComments == null) {
            return List.of();
        }
        return workoutComments.stream().map(WorkoutCommentConversor::toWorkoutCommentDto).toList();
    }
}
