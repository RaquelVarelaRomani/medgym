package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoutineDao extends JpaRepository<Routine, Long> {
    boolean existsByName(String name);
    Optional<Routine> findByName(String name);
}
