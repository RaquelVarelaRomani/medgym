package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.WrappedService;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/wrapped")
public class WrappedController {

    private final WrappedService wrappedService;

    public WrappedController(WrappedService wrappedService) {
        this.wrappedService = wrappedService;
    }

    @GetMapping("/weight-comparison")
    public WeightComparisonDto getWeightComparison(
            @RequestAttribute Long userId,
            @RequestParam(required = false) Integer year) throws InstanceNotFoundException {

        int targetYear = (year != null) ? year : LocalDateTime.now().getYear();

        return wrappedService.getWeightComparison(userId, targetYear);
    }
}
