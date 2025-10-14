package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.WorkoutExercise;

import java.util.List;

public class WorkoutExerciseConversor {

    private WorkoutExerciseConversor() {
    }

    public static WorkoutExerciseDto toWorkoutExerciseDto(WorkoutExercise workoutExercise) {
        return new WorkoutExerciseDto(workoutExercise.getId(), workoutExercise.getReps(), workoutExercise.getWeight(), workoutExercise.getDurationSeconds(), workoutExercise.getWorkout().getId(), workoutExercise.getRoutineExercise().getId());
    }

    public static List<WorkoutExerciseDto> toWorkoutExerciseDtos(List<WorkoutExercise> workoutExercises) {
        return workoutExercises.stream().map(WorkoutExerciseConversor::toWorkoutExerciseDto).toList();
    }
}
