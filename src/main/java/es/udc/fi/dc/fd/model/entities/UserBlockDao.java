package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserBlockDao extends JpaRepository<UserBlock, Long> {
    boolean existsByBlockerAndBlocked(User blocker, User blocked);
    void deleteByBlockerAndBlocked(User blocker, User blocked);
    List<UserBlock> findByBlocker(User blocker);
}
