package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutLikeDao;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SummaryServiceTest {

    @Autowired
    private SummaryService summaryService;

    @MockBean
    private WorkoutLikeDao workoutLikeDao;

    @MockBean
    private WorkoutCommentDao workoutCommentDao;

    @Test
    void testGetAnnualSummary() { 
        Long userId = 1L;

        when(workoutLikeDao.countByUserId(userId)).thenReturn(10L);
        when(workoutLikeDao.countByWorkoutUserId(userId)).thenReturn(5L);
        when(workoutCommentDao.countByUserId(userId)).thenReturn(3L);
        when(workoutCommentDao.countByWorkoutUserId(userId)).thenReturn(8L);

        AnnualSummaryDto result = summaryService.getAnnualSummary(userId);

        assertEquals(10L, result.getLikesGiven());
        assertEquals(5L, result.getLikesReceived());
        assertEquals(3L, result.getCommentsGiven());
        assertEquals(8L, result.getCommentsReceived());
    }
}