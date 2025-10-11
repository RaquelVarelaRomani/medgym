package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoutineSuscriptionDao extends JpaRepository<RoutineSuscription, Long> {
    @Query("SELECT rs FROM RoutineSuscription rs WHERE rs.routine.trainer.id = :trainerId")
    List<RoutineSuscription> findByTrainerId(@Param("trainerId") Long trainerId);
}
