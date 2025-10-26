package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Notification;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationConversor {
    private NotificationConversor() {}

    public static NotificationDto toNotificationDto(Notification notification) {


        NotificationDto notificationDto = new NotificationDto(
                notification.getId(),
                notification.getMessage().trim(),
                notification.getType().toString().trim(),
                notification.getIdToRedirect(),
                notification.getUser().getId(),
                notification.getIsRead(),
                notification.getDate()
        );

        notificationDto.setMessage(notification.getMessage());

        return notificationDto;
    }

    public static List<NotificationDto> toNotificationDtos(List<Notification> notifications) {
        return notifications.stream().map(NotificationConversor::toNotificationDto).collect(Collectors.toList());
    }
}
