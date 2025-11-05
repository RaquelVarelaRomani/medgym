package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoutineDao extends JpaRepository<Routine, Long> {

    boolean existsByName(String name);

    Optional<Routine> findByName(String name);

    @Query("SELECT DISTINCT r FROM Routine r JOIN FETCH r.routineExercises re JOIN FETCH re.exercise e WHERE e.muscleGroup = :muscleGroup")
    List<Routine> findByMuscleGroup(@Param("muscleGroup") String muscleGroup);

    @Query("SELECT DISTINCT r FROM Routine r JOIN FETCH r.routineExercises re JOIN FETCH re.exercise e WHERE e.equipment = :equipment")
    List<Routine> findByEquipment(@Param("equipment") String equipment);
}
