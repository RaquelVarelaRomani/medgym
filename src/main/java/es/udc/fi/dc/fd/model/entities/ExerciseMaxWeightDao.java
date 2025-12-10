package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseMaxWeightDao extends JpaRepository<ExerciseMaxWeight, Long> {
    ExerciseMaxWeight findByUserIdAndExerciseId(Long userId, Long exerciseId);
}
