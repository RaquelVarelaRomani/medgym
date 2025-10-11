package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineSuscription;
import es.udc.fi.dc.fd.model.entities.RoutineSuscriptionDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RoutineSuscriptionServiceImpl implements RoutineSuscriptionService {
    @Autowired
    private RoutineSuscriptionDao routineSuscriptionDao;

    @Autowired
    private UserService userService;

    @Override
    public Map<Routine, List<User>> getRoutineSuscriptions(Long trainerId) throws InstanceNotFoundException, PermissionException {
        User trainer = userService.loginFromId(trainerId);

        if (trainer.getRole() != User.RoleType.TRAINER){
            throw new PermissionException();
        }

        List<RoutineSuscription> routineSuscriptions = routineSuscriptionDao.findByTrainerId(trainerId);
        return routineSuscriptions.stream()
                .collect(Collectors.groupingBy(
                        RoutineSuscription::getRoutine,
                        Collectors.mapping(RoutineSuscription::getUser, Collectors.toList())
                ));
    }
}
