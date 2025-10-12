package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.NotificationConversor.toNotificationDtos;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> getUserNotifications(@RequestAttribute Long userId) {
        return toNotificationDtos(notificationService.getNotificationsByUser(userId));
    }
}
