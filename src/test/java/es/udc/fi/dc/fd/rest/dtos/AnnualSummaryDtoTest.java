package es.udc.fi.dc.fd.rest.dtos;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AnnualSummaryDtoTest {

    @Test
    void testGetters() {
        long likesGiven = 10L;
        long likesReceived = 20L;
        long commentsGiven = 5L;
        long commentsReceived = 8L;

        AnnualSummaryDto dto = new AnnualSummaryDto(likesGiven, likesReceived, commentsGiven, commentsReceived);

        assertEquals(likesGiven, dto.getLikesGiven());
        assertEquals(likesReceived, dto.getLikesReceived());
        assertEquals(commentsGiven, dto.getCommentsGiven());
        assertEquals(commentsReceived, dto.getCommentsReceived());
    }
}