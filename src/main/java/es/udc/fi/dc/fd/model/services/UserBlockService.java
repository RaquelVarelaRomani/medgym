package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface UserBlockService {

    void blockUser(Long blockerId, Long blockedId) throws InstanceNotFoundException, PermissionException;

    void unblockUser(Long blockerId, Long blockedId) throws InstanceNotFoundException;

    boolean isBlocked(Long userAId, Long userBId);
}
