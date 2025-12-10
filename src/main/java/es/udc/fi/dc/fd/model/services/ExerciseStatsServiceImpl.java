package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;
import es.udc.fi.dc.fd.model.entities.WorkoutExerciseDao;
import es.udc.fi.dc.fd.rest.dtos.ExerciseStatsDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Objects;


@Service
@Transactional(readOnly = true)
public class ExerciseStatsServiceImpl implements ExerciseStatsService {

    private final WorkoutExerciseDao workoutExerciseDao;
    private final ExerciseDao exerciseDao;

    public ExerciseStatsServiceImpl(WorkoutExerciseDao workoutExerciseDao,
                                    ExerciseDao exerciseDao) {
        this.workoutExerciseDao = workoutExerciseDao;
        this.exerciseDao = exerciseDao;
    }

    @Override
    public List<ExerciseStatsDto> getExerciseStats(Long exerciseId)
            throws InstanceNotFoundException {

        Exercise exercise = exerciseDao.findById(exerciseId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", exerciseId));

        boolean isWeighted = switch (exercise.getEquipment()) {
            case DUMBBELL, BARBELL, BENCH_AND_BARBELL, PULLEY -> true;
            default -> false;
        };

        List<WorkoutExercise> list =
                workoutExerciseDao.findByRoutineExercise_Exercise_Id(exerciseId);

        // agrupamos por fecha
        return list.stream()
                .collect(Collectors.groupingBy(
                        we -> we.getWorkout().getStartTime().toLocalDate()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<WorkoutExercise> dayItems = entry.getValue();

                    int maxWeight = dayItems.stream()
                            .map(WorkoutExercise::getWeight)
                            .filter(Objects::nonNull)
                            .mapToInt(Short::intValue)
                            .max().orElse(0);

                    int totalReps = dayItems.stream()
                            .map(WorkoutExercise::getReps)
                            .filter(Objects::nonNull)
                            .mapToInt(Short::intValue)
                            .sum();

                    int value = isWeighted ? maxWeight : totalReps;

                    return new ExerciseStatsDto(date, value);
                })
                .toList();
    }


}
