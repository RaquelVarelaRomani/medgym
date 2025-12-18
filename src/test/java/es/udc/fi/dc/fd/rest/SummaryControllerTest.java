package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.services.SummaryService;
import es.udc.fi.dc.fd.rest.controllers.SummaryController;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class SummaryControllerTest {

    private SummaryService summaryService;
    private SummaryController summaryController;

    @BeforeEach
    void setUp() {
        summaryService = Mockito.mock(SummaryService.class);
        summaryController = new SummaryController(summaryService);
    }

    @Test
    void testGetAnnualSummary() {
        AnnualSummaryDto mockSummary = new AnnualSummaryDto(10, 5, 3, 8);
        when(summaryService.getAnnualSummary(anyLong())).thenReturn(mockSummary);

        AnnualSummaryDto result = summaryController.getAnnualSummary(1L);

        assertEquals(10L, result.getLikesGiven());
        assertEquals(5L, result.getLikesReceived());
        assertEquals(3L, result.getCommentsGiven());
        assertEquals(8L, result.getCommentsReceived());
    }
}