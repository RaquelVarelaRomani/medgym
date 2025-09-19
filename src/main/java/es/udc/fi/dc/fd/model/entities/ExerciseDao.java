package es.udc.fi.dc.fd.model.entities;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseDao extends JpaRepository<Exercise, Long>{
    boolean existsByName(String name);
    Optional<Exercise> findByName(String name);
}
