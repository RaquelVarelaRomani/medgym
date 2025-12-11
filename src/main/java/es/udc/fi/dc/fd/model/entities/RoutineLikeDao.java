package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoutineLikeDao extends JpaRepository<RoutineLike, Long> {
    List<RoutineLike> findByUserId(Long userId);

    void deleteByUserIdAndRoutineId(Long userId, Long routineId);

    void deleteByRoutineId(Long routineId);

    List<RoutineLike> findByRoutineTrainerId(Long trainerId);
}
