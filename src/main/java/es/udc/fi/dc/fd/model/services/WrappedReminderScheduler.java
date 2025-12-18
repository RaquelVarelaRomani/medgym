package es.udc.fi.dc.fd.model.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WrappedReminderScheduler {

    private final NotificationService notificationService;

    public WrappedReminderScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 10 * * *", zone = "Europe/Madrid")
    public void daily10am() {
        notificationService.createDailyWrappedReminders();
    }
}
