package es.udc.fi.dc.fd.model.entities;

import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExerciseDao extends JpaRepository<Exercise, Long> {

    boolean existsByName(String name);

    Optional<Exercise> findByName(String name);

    List<Exercise> findByStatus(ExerciseStatus status);

    @Query("SELECT e FROM Exercise e WHERE e.status = :status OR (e.creator IS NOT NULL AND e.creator.id = :userId)")
    List<Exercise> findByStatusOrCreatorId(@Param("status") ExerciseStatus status, @Param("userId") Long userId);

}
