package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;

public interface PermissionChecker {

    void checkUserExists(Long userId) throws InstanceNotFoundException;

    User checkUser(Long userId) throws InstanceNotFoundException;

}
