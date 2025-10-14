package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;

import java.util.List;

public interface NotificationService {
    void createNotification(Routine routine) throws InstanceNotFoundException;
    List<Notification> getNotificationsByUser(Long userId);
    void markNotificationAsRead(Long notificationId);
    void deleteNotification(Long notificationId);
}
