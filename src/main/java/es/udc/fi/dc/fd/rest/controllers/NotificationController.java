package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;
import es.udc.fi.dc.fd.rest.dtos.NotificationFollowParamsDto;
import es.udc.fi.dc.fd.rest.dtos.NotificationLikeParamsDto;
import es.udc.fi.dc.fd.rest.dtos.NotificationNewRoutineParamsDto;
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

    @PostMapping( "/newRoutine")
    public void createNewRoutineNotification(@RequestBody NotificationNewRoutineParamsDto notificationNewRoutineParamsDto) throws InstanceNotFoundException {
        notificationService.createNewRoutineNotification(routineService.findRoutineById(notificationNewRoutineParamsDto.getRoutineId()));
    }

    @PostMapping( "/follow")
    public void createFollowNotification(@RequestBody NotificationFollowParamsDto notificationLikeOrFollowParamsDto) throws InstanceNotFoundException {
        notificationService.createFollowNotification(
                userService.findUserById(notificationLikeOrFollowParamsDto.getClientId()),
                userService.findUserById(notificationLikeOrFollowParamsDto.getTrainerId()));
    }

    @PostMapping("/like")
    public void createLikeNotification(@RequestBody NotificationLikeParamsDto notificationLikeOrFollowParamsDto) throws InstanceNotFoundException {
        notificationService.createLikeNotification(
                userService.findUserById(notificationLikeOrFollowParamsDto.getClientId()),
                userService.findUserById(notificationLikeOrFollowParamsDto.getTrainerId()),
                routineService.findRoutineById(notificationLikeOrFollowParamsDto.getRoutineId()));
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
