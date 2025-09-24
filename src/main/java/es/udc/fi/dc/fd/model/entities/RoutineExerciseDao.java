package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoutineExerciseDao extends JpaRepository<RoutineExercise, Long> {
    Optional<RoutineExercise> findByRoutineIdAndExerciseId(long routineId, long exerciseId);
    Page<RoutineExercise> findByRoutineId(long routineId, Pageable pageable);
}
