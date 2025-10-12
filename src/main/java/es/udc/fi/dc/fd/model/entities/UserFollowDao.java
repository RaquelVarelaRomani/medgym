package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserFollowDao extends JpaRepository<UserFollow, Long> {
    boolean existsByUserAndTrainer(User user, User trainer);
    Optional<UserFollow> findByUserAndTrainer(User user, User trainer);
}
