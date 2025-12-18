package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ExerciseMaxWeightServiceImpl implements ExerciseMaxWeightService {

    private final ExerciseMaxWeightDao exerciseMaxWeightDao;
    private final UserDao userDao;
    private final ExerciseDao exerciseDao;
    private final UserFollowService userFollowService;
    private final NotificationService notificationService;

    public ExerciseMaxWeightServiceImpl(
            ExerciseMaxWeightDao exerciseMaxWeightDao,
            UserDao userDao,
            ExerciseDao exerciseDao,
            UserFollowService userFollowService,
            NotificationService notificationService) {

        this.exerciseMaxWeightDao = exerciseMaxWeightDao;
        this.userDao = userDao;
        this.exerciseDao = exerciseDao;
        this.userFollowService = userFollowService;
        this.notificationService = notificationService;
    }

    @Override
    public void addOrUpdateMaxWeight(Long userId, Long exerciseId, Short maxWeightKg) throws InstanceNotFoundException {
        ExerciseMaxWeight exerciseMaxWeight = exerciseMaxWeightDao.findByUserIdAndExerciseId(userId, exerciseId);
        Short oldMax = exerciseMaxWeight == null ? (short) 0 : exerciseMaxWeight.getMaxWeightKg();
        boolean isNewRecord = false;

        if (exerciseMaxWeight == null) {
            exerciseMaxWeightDao.save(new ExerciseMaxWeight(
                    maxWeightKg,
                    userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId)),
                    exerciseDao.findById(exerciseId).orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", exerciseId))
            ));
            isNewRecord = true;
        } else {
            if (maxWeightKg > exerciseMaxWeight.getMaxWeightKg()) {
                exerciseMaxWeight.setMaxWeightKg(maxWeightKg);
                isNewRecord = true;
            }
        }

        if (isNewRecord) {
            checkExerciseRankingSurpass(userId, exerciseId, oldMax);
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

    private void checkExerciseRankingSurpass(Long userId, Long exerciseId, Short previousMaxWeightKg) throws InstanceNotFoundException {
        List<UserFollow> followers = userFollowService.getFollowers(userId);
        List<Long> followerIds = followers.stream().map(uf -> uf.getUser().getId()).toList();
        if (followerIds.isEmpty()) {
            return;
        }

        List<Long> userIds = new ArrayList<>(followerIds);
        userIds.add(userId);

        List<ExerciseMaxWeight> maxWeights = exerciseMaxWeightDao.findByExerciseIdAndUserIdIn(exerciseId, userIds);

        // Previous max weights
        Map<Long, Short> previousMaxWeights = new HashMap<>();
        for (Long uid : userIds) {
            Optional<ExerciseMaxWeight> emwOpt = maxWeights.stream().filter(emw -> emw.getUser().getId().equals(uid)).findFirst();
            if (emwOpt.isPresent()) {
                if (uid.equals(userId)) {
                    previousMaxWeights.put(uid, previousMaxWeightKg);
                } else {
                    previousMaxWeights.put(uid, emwOpt.get().getMaxWeightKg());
                }
            } else {
                previousMaxWeights.put(uid, (short) 0);
            }
        }

        // Sort users by previous max descending
        List<Long> previousRanking = previousMaxWeights.entrySet().stream()
                .sorted((e1, e2) -> Short.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        int previousPosition = previousRanking.indexOf(userId);

        // New max weights
        Map<Long, Short> newMaxWeights = new HashMap<>(previousMaxWeights);
        Short newMax = maxWeights.stream().filter(emw -> emw.getUser().getId().equals(userId)).findFirst().orElseThrow().getMaxWeightKg();
        newMaxWeights.put(userId, newMax);

        // Sort users by new max descending
        List<Long> newRanking = newMaxWeights.entrySet().stream()
                .sorted((e1, e2) -> Short.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        int newPosition = newRanking.indexOf(userId);

        // If new position < previous position, notify surpassed followers
        if (newPosition < previousPosition) {
            for (int i = newPosition + 1; i <= previousPosition; i++) {
                Long surpassedUserId = newRanking.get(i);
                if (followerIds.contains(surpassedUserId)) {
                    notificationService.createExerciseRankingSurpassNotification(surpassedUserId, userId, exerciseId);
                }
            }
        }
    }
}
