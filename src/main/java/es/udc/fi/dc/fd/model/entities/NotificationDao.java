package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationDao extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByDateDesc(Long userId);
    void deleteByIdToRedirect(Long idToRedirect);
}
