package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;

public interface SummaryService {
    AnnualSummaryDto getAnnualSummary(Long userId);
}