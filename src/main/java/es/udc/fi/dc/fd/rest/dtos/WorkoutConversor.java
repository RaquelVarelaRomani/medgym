package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Workout;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutCommentConversor.toWorkoutCommentDtos;
import static es.udc.fi.dc.fd.rest.dtos.WorkoutLikeConversor.toWorkoutLikeDtos;

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
        WorkoutForFeedDto workoutForFeedDto = new WorkoutForFeedDto();

        workoutForFeedDto.setId(workout.getId());
        workoutForFeedDto.setStartTime(workout.getStartTime());
        workoutForFeedDto.setEndTime(workout.getEndTime());
        workoutForFeedDto.setRoutineId(workout.getRoutine().getId());
        workoutForFeedDto.setRoutineName(workout.getRoutine().getName());
        workoutForFeedDto.setUserId(workout.getUser().getId());
        workoutForFeedDto.setUserName(workout.getUser().getName());
        workoutForFeedDto.setUserSurname(workout.getUser().getSurname());
        workoutForFeedDto.setUserProfilePicture(workout.getUser().getProfilePicture());
        workoutForFeedDto.setComments(toWorkoutCommentDtos(workout.getComments()));
        workoutForFeedDto.setLikes(toWorkoutLikeDtos(workout.getLikes()));

        return workoutForFeedDto;
    }

    public static WorkoutForHistoryDto toWorkoutForHistoryDto(Workout workout) {
        WorkoutForHistoryDto workoutForHistoryDto = new WorkoutForHistoryDto();

        workoutForHistoryDto.setId(workout.getId());
        workoutForHistoryDto.setStartTime(workout.getStartTime());
        workoutForHistoryDto.setEndTime(workout.getEndTime());
        workoutForHistoryDto.setRoutineId(workout.getRoutine().getId());
        workoutForHistoryDto.setRoutineName(workout.getRoutine().getName());
        workoutForHistoryDto.setUserId(workout.getUser().getId());
        workoutForHistoryDto.setUserName(workout.getUser().getName());
        workoutForHistoryDto.setUserSurname(workout.getUser().getSurname());
        workoutForHistoryDto.setComments(toWorkoutCommentDtos(workout.getComments()));
        workoutForHistoryDto.setLikes(toWorkoutLikeDtos(workout.getLikes()));

        return workoutForHistoryDto;
    }

    public static List<WorkoutDto> toWorkoutDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutDto).toList();
    }

    public static List<WorkoutForFeedDto> toWorkoutForFeedDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutForFeedDto).toList();
    }

    public static List<WorkoutForHistoryDto> toWorkoutForHistoryDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutForHistoryDto).toList();
    }

}
