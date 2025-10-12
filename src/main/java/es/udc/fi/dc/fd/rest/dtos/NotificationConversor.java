package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Notification;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationConversor {
    private NotificationConversor() {}

    public static NotificationDto toNotificationDto(Notification notification) {
        NotificationDto notificationDto = new NotificationDto();
        notificationDto.setId(notification.getId());
        notificationDto.setTime(notification.getDate());
        notificationDto.setMessage(notification.getRoutine().getName(), notification.getRoutine().getDescription());
        return notificationDto;
    }

    public static List<NotificationDto> toNotificationDtos(List<Notification> notifications) {
        return notifications.stream().map(NotificationConversor::toNotificationDto).collect(Collectors.toList());
    }
}
