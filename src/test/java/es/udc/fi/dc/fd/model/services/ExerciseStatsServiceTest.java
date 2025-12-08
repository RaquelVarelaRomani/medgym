package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;
import es.udc.fi.dc.fd.model.entities.WorkoutExerciseDao;
import es.udc.fi.dc.fd.rest.dtos.ExerciseStatsDto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class ExerciseStatsServiceTest {

        private WorkoutExerciseDao workoutExerciseDao;
        private ExerciseDao exerciseDao;
        private ExerciseStatsService service;

        @BeforeEach
        void setup() {
                workoutExerciseDao = Mockito.mock(WorkoutExerciseDao.class);
                exerciseDao = Mockito.mock(ExerciseDao.class);
                service = new ExerciseStatsServiceImpl(workoutExerciseDao, exerciseDao);
        }

        @Test
        void testExerciseNotFound() {
                when(exerciseDao.findById(anyLong())).thenReturn(Optional.empty());

                assertThrows(InstanceNotFoundException.class,
                        () -> service.getExerciseStats(999L));
        }

        @Test
        void testWeightedExerciseReturnsMaxWeight() throws Exception {

                Exercise exercise = new Exercise();
                exercise.setEquipment(DUMBBELL);

                when(exerciseDao.findById(1L)).thenReturn(Optional.of(exercise));

                // Mock workouts
                Workout w1 = Mockito.mock(Workout.class);
                Workout w2 = Mockito.mock(Workout.class);

                when(w1.getStartTime()).thenReturn(LocalDate.of(2024, 1, 10).atStartOfDay());
                when(w2.getStartTime()).thenReturn(LocalDate.of(2024, 1, 12).atStartOfDay());

                // WorkoutExercises
                WorkoutExercise we1 = new WorkoutExercise((short) 10, (short) 40, null, w1, null);
                WorkoutExercise we2 = new WorkoutExercise((short) 15, (short) 50, null, w2, null);

                when(workoutExerciseDao.findByRoutineExercise_Exercise_Id(1L))
                        .thenReturn(List.of(we1, we2));

                List<ExerciseStatsDto> stats = service.getExerciseStats(1L);

                assertEquals(2, stats.size());
                assertEquals(40, stats.get(0).getValue());
                assertEquals(50, stats.get(1).getValue());
                }

        @Test
        void testNonWeightedExerciseReturnsTotalReps() throws Exception {

                Exercise exercise = new Exercise();
                exercise.setEquipment(NONE);

                when(exerciseDao.findById(2L)).thenReturn(Optional.of(exercise));

                Workout w1 = Mockito.mock(Workout.class);
                Workout w2 = Mockito.mock(Workout.class);

                when(w1.getStartTime()).thenReturn(LocalDate.of(2024, 1, 10).atStartOfDay());
                when(w2.getStartTime()).thenReturn(LocalDate.of(2024, 1, 12).atStartOfDay());

                WorkoutExercise we1 = new WorkoutExercise((short) 30, null, null, w1, null);
                WorkoutExercise we2 = new WorkoutExercise((short) 45, null, null, w2, null);

                when(workoutExerciseDao.findByRoutineExercise_Exercise_Id(2L))
                        .thenReturn(List.of(we1, we2));

                List<ExerciseStatsDto> stats = service.getExerciseStats(2L);

                assertEquals(30, stats.get(0).getValue());
                assertEquals(45, stats.get(1).getValue());
        }

        @Test
        void testResultsAreSortedChronologically() throws Exception {

                Exercise exercise = new Exercise();
                exercise.setEquipment(DUMBBELL);

                when(exerciseDao.findById(3L)).thenReturn(Optional.of(exercise));

                Workout w1 = Mockito.mock(Workout.class);
                Workout w2 = Mockito.mock(Workout.class);
                Workout w3 = Mockito.mock(Workout.class);

                when(w1.getStartTime()).thenReturn(LocalDate.of(2024, 1, 15).atStartOfDay());
                when(w2.getStartTime()).thenReturn(LocalDate.of(2024, 1, 10).atStartOfDay());
                when(w3.getStartTime()).thenReturn(LocalDate.of(2024, 1, 12).atStartOfDay());

                WorkoutExercise we1 = new WorkoutExercise((short) 20, (short) 60, null, w1, null);
                WorkoutExercise we2 = new WorkoutExercise((short) 10, (short) 40, null, w2, null);
                WorkoutExercise we3 = new WorkoutExercise((short) 15, (short) 50, null, w3, null);

                when(workoutExerciseDao.findByRoutineExercise_Exercise_Id(3L))
                        .thenReturn(List.of(we1, we2, we3));

                List<ExerciseStatsDto> stats = service.getExerciseStats(3L);

                assertEquals(LocalDate.of(2024, 1, 10), stats.get(0).getDate());
                assertEquals(LocalDate.of(2024, 1, 12), stats.get(1).getDate());
                assertEquals(LocalDate.of(2024, 1, 15), stats.get(2).getDate());
        }
}
