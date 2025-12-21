package es.udc.fi.dc.fd.model.services;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class WrappedReminderScheduler {

    private final NotificationService notificationService;

    public WrappedReminderScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 10 * * *", zone = "Europe/Madrid")
    public void daily10am() {
        notificationService.createDailyWrappedReminders();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void runOnStartup() {
        notificationService.createDailyWrappedReminders();
    }
}
