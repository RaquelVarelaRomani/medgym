package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;

import java.util.List;
import java.util.Optional;

public interface ExerciseDao extends JpaRepository<Exercise, Long> {

	boolean existsByName(String name);

	Optional<Exercise> findByName(String name);

	List<Exercise> findByStatus(ExerciseStatus status);

}
