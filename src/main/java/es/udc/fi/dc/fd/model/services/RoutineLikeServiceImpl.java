package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoutineLikeServiceImpl implements RoutineLikeService {

    @Autowired
    private RoutineLikeDao routineLikeDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void likeRoutine(Long userId, Long routineId) throws InstanceNotFoundException {
        routineLikeDao.save(new RoutineLike(
                userDao.findById(userId).orElseThrow(() ->
                        new InstanceNotFoundException("project.entities.routineLikeDao", userId)),
                routineDao.findById(routineId).orElseThrow(() ->
                        new InstanceNotFoundException("project.entities.routineLikeDao", routineId))
        ));

        Routine routine = routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId));
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        notificationService.createRoutineLikeNotification(
                user.getId(),
                routine.getId()
        );
    }

    @Override
    public List<RoutineLike> getRoutineLikesByUser(Long userId) {
        return routineLikeDao.findByUserId(userId);
    }

    @Override
    public void unlikeRoutine(Long userId, Long routineId) {
        routineLikeDao.deleteByUserIdAndRoutineId(userId, routineId);
    }
}
