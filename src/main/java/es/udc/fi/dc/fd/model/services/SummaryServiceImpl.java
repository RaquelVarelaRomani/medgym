package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.RoutineLikeDao;
import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutLikeDao;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SummaryServiceImpl implements SummaryService {

    //private final RoutineLikeDao routineLikeDao;
    private final WorkoutLikeDao workoutLikeDao;
    private final WorkoutCommentDao workoutCommentDao;

    public SummaryServiceImpl(WorkoutLikeDao workoutLikeDao, WorkoutCommentDao workoutCommentDao) {
        this.workoutLikeDao = workoutLikeDao;
        this.workoutCommentDao = workoutCommentDao;
    }

    @Override
    public AnnualSummaryDto getAnnualSummary(Long userId) {
        //likes dado -> suma likes a rutinas + likes a workouts hechos por el usuario
        long likesGiven = workoutLikeDao.countByUserId(userId);

        //recibidos ->likes recibidos en sus rutinas + en sus workouts
        long likesReceived = workoutLikeDao.countByWorkoutUserId(userId);

        //coments dados
        long commentsGiven = workoutCommentDao.countByUserId(userId);

        //recibidos
        long commentsReceived = workoutCommentDao.countByWorkoutUserId(userId);

        return new AnnualSummaryDto(likesGiven, likesReceived, commentsGiven, commentsReceived);
    }
}