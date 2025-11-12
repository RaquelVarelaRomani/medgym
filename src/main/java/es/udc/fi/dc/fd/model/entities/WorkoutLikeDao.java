package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutLikeDao extends JpaRepository<WorkoutLike, Long> {
    void deleteByUserIdAndWorkoutId(Long userId, Long workoutId);

    List<WorkoutLike> findByUserId(Long userId);
}
