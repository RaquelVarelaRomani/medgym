package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineSuscription;
import es.udc.fi.dc.fd.model.services.RoutineSuscriptionService;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.RoutineSuscriptionDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.RoutineSuscriptionConversor.toRoutineSuscriptionDto;

@RestController
@RequestMapping("/api/trainer/routines/followers")
public class RoutineSuscriptionController {
    @Autowired
    private RoutineSuscriptionService routineSuscriptionService;

    @GetMapping
    public List<RoutineSuscriptionDto> getFollowers(@RequestAttribute Long userId) throws PermissionException, InstanceNotFoundException {
        return toRoutineSuscriptionDto(routineSuscriptionService.getRoutineSuscriptions(userId));
    }
}
