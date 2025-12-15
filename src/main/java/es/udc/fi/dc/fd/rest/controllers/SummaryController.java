package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.SummaryService;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/annual")
    public AnnualSummaryDto getAnnualSummary(@RequestAttribute Long userId) {
        return summaryService.getAnnualSummary(userId);
    }
}