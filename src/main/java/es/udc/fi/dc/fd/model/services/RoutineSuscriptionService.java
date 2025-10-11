package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineSuscription;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import java.util.List;
import java.util.Map;

public interface RoutineSuscriptionService {
    Map<Routine, List<User>> getRoutineSuscriptions(Long trainerId) throws InstanceNotFoundException, PermissionException;
}
