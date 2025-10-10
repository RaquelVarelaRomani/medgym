package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Workout;

import java.util.List;

public class WorkoutConversor {

    private WorkoutConversor() {
    }

    public static WorkoutDto toWorkoutDto(Workout workout) {
        return new WorkoutDto(workout.getId(), workout.getStartTime(), workout.getEndTime(), workout.getRoutine().getId(), workout.getUser().getId());
    }

    public static List<WorkoutDto> toWorkoutDtos(List<Workout> workouts) {
        return workouts.stream().map(WorkoutConversor::toWorkoutDto).toList();
    }

}
