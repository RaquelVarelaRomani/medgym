package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;
import es.udc.fi.dc.fd.model.services.UserBlockService;
import es.udc.fi.dc.fd.model.services.WorkoutExerciseService;
import es.udc.fi.dc.fd.model.services.WorkoutService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.StatisticsConversor;
import es.udc.fi.dc.fd.rest.dtos.StatisticsDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutForFeedDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutForHistoryDto;
import es.udc.fi.dc.fd.rest.common.JwtInfo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutConversor.*;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private WorkoutExerciseService workoutExerciseService;

    @Autowired
    private UserBlockService userBlockService;

    @PostMapping("/start")
    public WorkoutDto startWorkout(@RequestAttribute Long userId, @RequestBody WorkoutDto workoutDto) throws InstanceNotFoundException {
        return toWorkoutDto(workoutService.startWorkout(workoutDto.getRoutineId(), userId));
    }

    @PutMapping("/{id}/finish")
    public void finishWorkout(@PathVariable Long id) throws InstanceNotFoundException {
        workoutService.finishWorkout(id);
    }

    @GetMapping("/{id}")
    public WorkoutDto getWorkout(@PathVariable Long id, @RequestAttribute Long userId) throws InstanceNotFoundException, PermissionException {
        var workout = workoutService.findWorkoutById(id);

        Long requesterId = userId;
        Long ownerId = workout.getUser().getId();

        if (userBlockService.hasBlocked(ownerId, requesterId)) {
            throw new PermissionException();
        }

        return toWorkoutDto(workout);
    }

    @GetMapping
    public List<WorkoutForHistoryDto> getWorkouts(@RequestAttribute Long userId) {
        return toWorkoutForHistoryDtos(workoutService.findWorkoutsFromUser(userId));
    }

    @GetMapping("/following")
    public List<WorkoutForFeedDto> getWorkoutsFromFollowing(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return toWorkoutForFeedDtos(workoutService.findWorkoutsFromFollowing(userId));
    }

    @GetMapping("/user/{userId}")
    public List<WorkoutDto> getWorkoutsByUser(@PathVariable Long userId, @RequestAttribute Long userIdRequester) throws PermissionException {
        Long requesterId = userIdRequester;
        Long ownerId = userId;
        // Si el dueño ha bloqueado al que hace la petición → no se permite ver
        if (userBlockService.hasBlocked(ownerId, requesterId)) {
            throw new PermissionException();
        }

        return toWorkoutDtos(workoutService.findWorkoutsFromUser(userId));
    }

    @GetMapping("/stats")
    public StatisticsDto getLastMonthStats(@RequestAttribute Long userId) {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Workout> workouts = workoutService.findWorkoutsByUserAndDateRange(userId, startOfLastMonth, endOfLastMonth);
        List<Long> workoutIds = workouts.stream().map(Workout::getId).toList();
        List<WorkoutExercise> performedExercises = workoutExerciseService.findWorkoutExercisesByWorkoutIds(workoutIds);

        return StatisticsConversor.toStatisticsDto(workouts, performedExercises);
    }
}
