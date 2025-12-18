package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;

public interface WrappedService {

    Long calculateYearlyTotalWeight(Long userId, int year) throws InstanceNotFoundException;

    WeightComparisonDto getWeightComparison(Long userId, int year) throws InstanceNotFoundException;
}
