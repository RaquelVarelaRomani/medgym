package es.udc.fi.dc.fd.model.entities;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface WorkoutDao extends JpaRepository<Workout, Long>  {

    List<Workout> findAllByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Workout w WHERE w.routine.id = :routineId")
    void deleteByRoutineId(Long routineId);

    List<Workout> findByUserIdAndStartTimeBetweenAndEndTimeNotNull(Long userId, LocalDateTime startTime, LocalDateTime endTime);
}
