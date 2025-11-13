package es.udc.fi.dc.fd.rest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.UserBlockService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.JwtInfo;

@RestController
@RequestMapping("/api/blocks")
public class UserBlockController {

    @Autowired
    private UserBlockService userBlockService;

    @PostMapping("/{blockedId}")
    public ResponseEntity<Void> blockUser(
            @PathVariable Long blockedId,
            @AuthenticationPrincipal JwtInfo jwtInfo)
            throws InstanceNotFoundException, PermissionException {

        userBlockService.blockUser(jwtInfo.getUserId(), blockedId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{blockedId}")
    public ResponseEntity<Void> unblockUser(
            @PathVariable Long blockedId,
            @AuthenticationPrincipal JwtInfo jwtInfo)
            throws InstanceNotFoundException {

        userBlockService.unblockUser(jwtInfo.getUserId(), blockedId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/is-blocked/{otherUserId}")
    public ResponseEntity<Boolean> isBlocked(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal JwtInfo jwtInfo) {

        boolean blocked = userBlockService.isBlocked(jwtInfo.getUserId(), otherUserId);
        return ResponseEntity.ok(blocked);
    }
}
