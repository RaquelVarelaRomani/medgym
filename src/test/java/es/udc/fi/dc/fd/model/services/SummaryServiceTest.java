package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutLikeDao;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class SummaryServiceTest {

    private WorkoutLikeDao workoutLikeDao;
    private WorkoutCommentDao workoutCommentDao;
    private SummaryService summaryService;

    @BeforeEach
    void setUp() {
        workoutLikeDao = Mockito.mock(WorkoutLikeDao.class);
        workoutCommentDao = Mockito.mock(WorkoutCommentDao.class);
        summaryService = new SummaryServiceImpl(workoutLikeDao, workoutCommentDao);
    }

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