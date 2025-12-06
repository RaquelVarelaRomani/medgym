package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutCommentDao extends JpaRepository<WorkoutComment, Long> {
    List<WorkoutComment> findByWorkoutId(Long workoutId);
    List<WorkoutComment> findByUserId(Long userId);
}
