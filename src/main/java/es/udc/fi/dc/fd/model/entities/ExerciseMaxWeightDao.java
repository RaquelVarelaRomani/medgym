package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseMaxWeightDao extends JpaRepository<ExerciseMaxWeight, Long> {
    ExerciseMaxWeight findByUserIdAndExerciseId(Long userId, Long exerciseId);
    List<ExerciseMaxWeight> findByExerciseIdAndUserIdIn(Long exerciseId, List<Long> userIds);
}
