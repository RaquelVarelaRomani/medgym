package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.UserBlock;
import es.udc.fi.dc.fd.model.entities.UserBlockDao;
//import es.udc.fi.dc.fd.model.entities.UserFollowDao;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
@Service
@Transactional
public class UserBlockServiceImpl implements UserBlockService {

    @Autowired
    private UserDao userDao;

    //@Autowired
    //private UserFollowDao userFollowDao;

    @Autowired
    private UserBlockDao userBlockDao;

    @Override
    public void blockUser(Long blockerId, Long blockedId) throws InstanceNotFoundException, PermissionException {
        if (blockerId.equals(blockedId))
            throw new PermissionException("No puedes bloquearte a ti mismo.");

        User blocker = userDao.findById(blockerId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario bloqueador no encontrado.", blockerId));

        User blocked = userDao.findById(blockedId)
                .orElseThrow(() -> new InstanceNotFoundException("Usuario a bloquear no encontrado.", blockedId));

        if (!userBlockDao.existsByBlockerAndBlocked(blocker, blocked)) {
            //userFollowDao.deleteByFollowerAndFollowed(blocker, blocked);
            //userFollowDao.deleteByFollowerAndFollowed(blocked, blocker);

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
    public boolean isBlocked(Long userAId, Long userBId) {
        User userA = userDao.getReferenceById(userAId);
        User userB = userDao.getReferenceById(userBId);
        return userBlockDao.existsByBlockerAndBlocked(userA, userB)
            || userBlockDao.existsByBlockerAndBlocked(userB, userA);
    }
}
