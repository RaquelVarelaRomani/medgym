package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoutineLikeDao extends JpaRepository<RoutineLike, Long> {
    List<RoutineLike> findByUserId(Long userId);

    //para contar los likes que ha dado
    long countByUserId(Long userId);

    //contar los likes que recibio en sus rutinas
    @Query("SELECT COUNT(rl) FROM RoutineLike rl WHERE rl.routine.trainer.id = :userId")
    long countByRoutineUserId(@Param("userId") Long userId);

    void deleteByUserIdAndRoutineId(Long userId, Long routineId);

    void deleteByRoutineId(Long routineId);

    List<RoutineLike> findByRoutineTrainerId(Long trainerId);
}
