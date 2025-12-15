package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutCommentDao extends JpaRepository<WorkoutComment, Long> {
    List<WorkoutComment> findByWorkoutId(Long workoutId);
    List<WorkoutComment> findByUserId(Long userId);

    //cuenta los comentarios que escribio
    long countByUserId(Long userId);

    //cuenta los que recibio en los workouts
    @Query("SELECT COUNT(wc) FROM WorkoutComment wc WHERE wc.workout.user.id = :userId")
    long countByWorkoutUserId(@Param("userId") Long userId);
}
