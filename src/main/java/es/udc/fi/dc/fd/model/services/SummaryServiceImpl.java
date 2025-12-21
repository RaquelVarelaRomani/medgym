package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutLikeDao;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SummaryServiceImpl implements SummaryService {

    private final WorkoutLikeDao workoutLikeDao;
    private final WorkoutCommentDao workoutCommentDao;

    public SummaryServiceImpl(WorkoutLikeDao workoutLikeDao, WorkoutCommentDao workoutCommentDao) {
        this.workoutLikeDao = workoutLikeDao;
        this.workoutCommentDao = workoutCommentDao;
    }

    @Override
    public AnnualSummaryDto getAnnualSummary(Long userId) {
        long likesGiven = workoutLikeDao.countByUserId(userId);
        long likesReceived = workoutLikeDao.countByWorkoutUserId(userId);
        long commentsGiven = workoutCommentDao.countByUserId(userId);
        long commentsReceived = workoutCommentDao.countByWorkoutUserId(userId);

        return new AnnualSummaryDto(likesGiven, likesReceived, commentsGiven, commentsReceived);
    }
}