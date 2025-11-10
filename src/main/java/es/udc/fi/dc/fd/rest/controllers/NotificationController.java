package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.WorkoutService;
import es.udc.fi.dc.fd.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.NotificationConversor.toNotificationDtos;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RoutineService routineService;
    @Autowired
    private UserService userService;
    @Autowired
    private WorkoutService workoutService;

    @PostMapping( "/newRoutine")
    public void createNewRoutineNotification(@RequestBody NotificationNewRoutineParamsDto notificationNewRoutineParamsDto) throws InstanceNotFoundException {
        notificationService.createNewRoutineNotification(notificationNewRoutineParamsDto.getRoutineId());
    }

    @PostMapping( "/follow")
    public void createFollowNotification(@RequestBody NotificationFollowParamsDto notificationFollowParamsDto) throws InstanceNotFoundException {
        notificationService.createFollowNotification(
                notificationFollowParamsDto.getClientId(),
                notificationFollowParamsDto.getTrainerId()
        );
    }

    @PostMapping("/routineLike")
    public void createRoutineLikeNotification(@RequestBody NotificationRoutineLikeParamsDto notificationRoutineLikeParamsDto) throws InstanceNotFoundException {
        notificationService.createRoutineLikeNotification(
                notificationRoutineLikeParamsDto.getClientId(),
                notificationRoutineLikeParamsDto.getRoutineId()
        );
    }

    @PostMapping("/workoutLike")
    public void createWorkoutLikeNotification(@RequestBody NotificationWorkoutLikeParamsDto notificationWorkoutLikeParamsDto) throws InstanceNotFoundException {
        notificationService.createWorkoutLikeNotification(
                notificationWorkoutLikeParamsDto.getUserId(),
                notificationWorkoutLikeParamsDto.getWorkoutId()
        );
    }

    @GetMapping
    public List<NotificationDto> getUserNotifications(@RequestAttribute Long userId) {
        return toNotificationDtos(notificationService.getNotificationsByUser(userId));
    }

    @PutMapping("/{id}/read")
    public void markNotificationAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}
