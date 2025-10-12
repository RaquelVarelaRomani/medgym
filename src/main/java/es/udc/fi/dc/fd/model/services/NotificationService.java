package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsByUser(Long userId);
}
