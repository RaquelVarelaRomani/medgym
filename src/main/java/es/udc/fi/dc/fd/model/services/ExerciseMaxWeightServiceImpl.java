package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ExerciseMaxWeightServiceImpl implements ExerciseMaxWeightService {

    private final ExerciseMaxWeightDao exerciseMaxWeightDao;
    private final UserDao userDao;
    private final ExerciseDao exerciseDao;
    private final UserFollowService userFollowService;

    public ExerciseMaxWeightServiceImpl(
            ExerciseMaxWeightDao exerciseMaxWeightDao,
            UserDao userDao,
            ExerciseDao exerciseDao,
            UserFollowService userFollowService) {

        this.exerciseMaxWeightDao = exerciseMaxWeightDao;
        this.userDao = userDao;
        this.exerciseDao = exerciseDao;
        this.userFollowService = userFollowService;
    }

    @Override
    public void addOrUpdateMaxWeight(Long userId, Long exerciseId, Short maxWeightKg) throws InstanceNotFoundException {

        if (maxWeightKg == null) return;

        ExerciseMaxWeight exerciseMaxWeight = exerciseMaxWeightDao.findByUserIdAndExerciseId(userId, exerciseId);

        if (exerciseMaxWeight == null) {
            exerciseMaxWeightDao.save(new ExerciseMaxWeight(
                    maxWeightKg,
                    userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId)),
                    exerciseDao.findById(exerciseId).orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", exerciseId))
            ));
        } else {
            if (maxWeightKg > exerciseMaxWeight.getMaxWeightKg()) {
                exerciseMaxWeight.setMaxWeightKg(maxWeightKg);
            }
        }
    }

    @Override
    public List<ExerciseMaxWeight> getMaxWeightRanking(Long userId, Long exerciseId) throws InstanceNotFoundException {
        List<User> followers = userFollowService.getFollowedUsers(userId).stream().map(UserFollow::getFollowUser).toList();

        var maxWeight = exerciseMaxWeightDao.findByUserIdAndExerciseId(userId, exerciseId);

        List<ExerciseMaxWeight> ranking = new ArrayList<>(maxWeight == null ? List.of() : List.of(maxWeight));

        for (User follower : followers) {
            maxWeight = exerciseMaxWeightDao.findByUserIdAndExerciseId(follower.getId(), exerciseId);
            if (maxWeight != null) ranking.add(maxWeight);
        }

        return ranking;
    }
}
