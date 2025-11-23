package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class UserBlockServiceImpl implements UserBlockService {
    private final UserDao userDao;
    private final UserFollowDao userFollowDao;
    private final UserBlockDao userBlockDao;

    public UserBlockServiceImpl(UserDao userDao, UserFollowDao userFollowDao, UserBlockDao userBlockDao) {
        this.userDao = userDao;
        this.userFollowDao = userFollowDao;
        this.userBlockDao = userBlockDao;
    }

    @Override
    public void blockUser(Long blockerId, Long blockedId) throws InstanceNotFoundException, PermissionException {
        if (blockerId.equals(blockedId))
            throw new PermissionException("No puedes bloquearte a ti mismo.");

        User blocker = userDao.findById(blockerId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario bloqueador no encontrado.", blockerId));

        User blocked = userDao.findById(blockedId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario a bloquear no encontrado.", blockedId));

        if (!userBlockDao.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            userFollowDao.deleteByUserAndFollowUser(blocked, blocker);

            UserBlock block = new UserBlock();
            block.setBlocker(blocker);
            block.setBlocked(blocked);
            block.setCreatedAt(LocalDateTime.now());
            userBlockDao.save(block);
        }
    }


    @Override
    public void unblockUser(Long blockerId, Long blockedId) throws InstanceNotFoundException {
        User blocker = userDao.findById(blockerId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario bloqueador no encontrado.", blockerId));
        User blocked = userDao.findById(blockedId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario a desbloquear no encontrado.", blockedId));

        userBlockDao.deleteByBlockerAndBlocked(blocker, blocked);
    }

    @Override
    public boolean hasBlocked(Long blockerId, Long blockedId) {
        return userBlockDao.existsByBlockerIdAndBlockedId(blockerId, blockedId);
    }


    //Bidireccional (para proteger acceso a perfil/workouts/feed)
    @Override
    public boolean isBlocked(Long userAId, Long userBId) {
        return hasBlocked(userAId, userBId) || hasBlocked(userBId, userAId);
    }
}
