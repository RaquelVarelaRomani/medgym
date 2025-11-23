package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDtos;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<UserDto> getAllUsers() {
        return toUserDtos(userService.findAllUsers());
    }

    @PutMapping("/users/{id}/block")
    public void blockUser(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException, PermissionException {
        userService.blockUser(userId, id);
    }

    @PutMapping("/users/{id}/unblock")
    public void unblockUser(@RequestAttribute Long userId, @PathVariable Long id) throws InstanceNotFoundException, PermissionException {
        userService.unblockUser(userId, id);
    }

    @PutMapping("/users/{id}/premium")
    public void setTrainerPremium(@RequestAttribute Long userId, @PathVariable Long id, @RequestParam boolean premium) throws InstanceNotFoundException, PermissionException {
        userService.setTrainerPremium(id, premium);
    }

}
