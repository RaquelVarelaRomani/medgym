package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AchievementDao extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByName(String name);
}
