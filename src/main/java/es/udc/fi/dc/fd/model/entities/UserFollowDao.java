package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserFollowDao extends JpaRepository<UserFollow, Long> {
    boolean existsByUserAndFollowUser(User user, User followUser);

    Optional<UserFollow> findByUserAndFollowUser(User user, User followUser);

    List<UserFollow> findByFollowUser(User followUser);

    List<UserFollow> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUserAndFollowUser(User user, User followUser);
}
