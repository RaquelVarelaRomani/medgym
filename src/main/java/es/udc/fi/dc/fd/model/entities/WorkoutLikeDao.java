package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkoutLikeDao extends JpaRepository<WorkoutLike, Long> {
    void deleteByUserIdAndWorkoutId(Long userId, Long workoutId);

    List<WorkoutLike> findByUserId(Long userId);

    //contar likes que dio
    long countByUserId(Long userId);

    //contar likes que recibio en los workouts
    @Query("SELECT COUNT(wl) FROM WorkoutLike wl WHERE wl.workout.user.id = :userId")
    long countByWorkoutUserId(@Param("userId") Long userId);


    Optional<WorkoutLike> findByUserIdAndWorkoutId(Long userId, Long workoutId);
}
