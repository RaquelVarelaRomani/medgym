package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutExerciseDao extends JpaRepository<WorkoutExercise, Long> {
    List<WorkoutExercise> findByWorkoutId(Long workoutId);

    List<WorkoutExercise> findByWorkoutIdIn(List<Long> workoutIds);

    List<WorkoutExercise> findByRoutineExercise_Exercise_Id(Long exerciseId);

}