package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;
import es.udc.fi.dc.fd.rest.dtos.NotificationParamsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.NotificationConversor.toNotificationDto;
import static es.udc.fi.dc.fd.rest.dtos.NotificationConversor.toNotificationDtos;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RoutineService routineService;

    @PostMapping
    public void createNotification(@RequestAttribute Long userId, @RequestBody NotificationParamsDto notificationParamsDto) throws PermissionException, InstanceNotFoundException {
        notificationService.createNotification(routineService.findRoutineById(userId, notificationParamsDto.getRoutineId()));
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
