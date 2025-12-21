package es.udc.fi.dc.fd;

import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineLike;
import es.udc.fi.dc.fd.model.entities.RoutineLikeDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.UserFollow;
import es.udc.fi.dc.fd.model.entities.UserFollowDao;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;
import es.udc.fi.dc.fd.model.entities.WorkoutLike;
import es.udc.fi.dc.fd.model.entities.WorkoutLikeDao;
import es.udc.fi.dc.fd.model.services.AchievementProgressService;
import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.model.services.WorkoutExerciseService;
import es.udc.fi.dc.fd.model.services.WorkoutService;
import es.udc.fi.dc.fd.model.entities.WorkoutExerciseDao;
import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeightDao;
import es.udc.fi.dc.fd.model.services.ExerciseMaxWeightService;
import java.util.*;
import java.util.stream.*;

@SpringBootApplication
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public MessageSource messageSource() {

        ReloadableResourceBundleMessageSource bean = new ReloadableResourceBundleMessageSource();

        bean.setBasename("classpath:messages");
        bean.setDefaultEncoding("UTF-8");

        return bean;
    }

    @Bean
    public LocalValidatorFactoryBean validator() {

        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();

        bean.setValidationMessageSource(messageSource());

        return bean;
    }

    @Bean
    public CommandLineRunner recalculateAchievementsRunner(UserDao userDao, AchievementProgressService achievementProgressService) {
        return args -> {
            for (User user : userDao.findAll()) {
                try {
                    achievementProgressService.recalculateAchievementProgressForUser(user.getId());
                } catch (InstanceNotFoundException e) {
                //
                }
            }
        };
    }

    @Bean
    public CommandLineRunner calculateTotalVolumeRunner(WorkoutDao workoutDao, WorkoutExerciseService workoutExerciseService) {
        return args -> {
            for (Workout workout : workoutDao.findAll()) {
                try {
                    List<WorkoutExercise> exercises = workoutExerciseService.findWorkoutExercisesByWorkoutId(workout.getId());

                    int totalVolume = exercises.stream()
                            .filter(we -> we.getReps() != null && we.getWeight() != null)
                            .mapToInt(we -> we.getReps() * we.getWeight())
                            .sum();
                    workout.setTotalVolume(totalVolume);
                    workoutDao.save(workout);
                } catch (InstanceNotFoundException e) {
                    //
                }
            }
        };
    }

    @Bean
    public CommandLineRunner recalculateLikesReceivedRunner(
            UserDao userDao,
            WorkoutLikeDao workoutLikeDao,
            RoutineLikeDao routineLikeDao,
            NotificationService notificationService) {
        return args -> {
            for (User user : userDao.findAll()) {
                try {
                    List<WorkoutLike> workoutLikesReceived = workoutLikeDao.findByWorkoutUserId(user.getId());
                    for (WorkoutLike workoutLike : workoutLikesReceived) {
                        notificationService.createWorkoutLikeNotification(
                                workoutLike.getUser().getId(),
                                workoutLike.getWorkout().getId());
                    }

                    List<RoutineLike> routineLikesReceived = routineLikeDao.findByRoutineTrainerId(user.getId());
                    for (RoutineLike routineLike : routineLikesReceived) {
                        notificationService.createRoutineLikeNotification(
                                routineLike.getUser().getId(),
                                routineLike.getRoutine().getId());
                    }
                } catch (InstanceNotFoundException e) {
                    //
                }
            }
        };
    }

    @Bean
    public CommandLineRunner recalculateFollowsReceivedRunner(
            UserDao userDao,
            UserFollowDao userFollowDao,
            NotificationService notificationService) {
        return args -> {
            for (User user : userDao.findAll()) {
                try {
                    List<UserFollow> followsReceived = userFollowDao.findByFollowUser(user);
                    for (UserFollow userFollow : followsReceived) {
                        notificationService.createFollowNotification(
                                userFollow.getUser().getId(),
                                userFollow.getFollowUser().getId());
                    }
                } catch (InstanceNotFoundException e) {
                    //
                }
            }
        };
    }

    @Bean
    public CommandLineRunner recalculateStreakRemindersRunner(
            UserDao userDao,
            WorkoutService workoutService,
            NotificationService notificationService) {
        return args -> {
            // Check if current time is after the scheduled cron time (9 AM)
            LocalTime currentTime = LocalTime.now();
            LocalTime scheduledTime = LocalTime.of(9, 0);

            if (currentTime.isAfter(scheduledTime)) {
                for (User user : userDao.findAll()) {
                    try {
                        int currentStreak = workoutService.calculateCurrentStreak(user.getId());
                        if (currentStreak > 1) {
                            notificationService.createStreakRemindNotification(user.getId(), currentStreak);
                        }
                    } catch (InstanceNotFoundException e) {
                        //
                    }
                }
            }
        };
    }

    @Bean
    public CommandLineRunner recalculateNewRoutineNotificationsRunner(
            UserDao userDao,
            UserFollowDao userFollowDao,
            RoutineDao routineDao,
            NotificationService notificationService) {
        return args -> {
            for (User user : userDao.findAll()) {
                try {
                    List<UserFollow> userFollows = userFollowDao.findByUser(user);

                    for (UserFollow userFollow : userFollows) {
                        List<Routine> routines = routineDao.findByTrainerIdOrderByCreationDateDesc(userFollow.getFollowUser().getId());
                        if (!routines.isEmpty()) {
                            Routine latestRoutine = routines.get(0);
                            notificationService.createNewRoutineNotification(latestRoutine.getId());
                        }
                    }
                } catch (InstanceNotFoundException e) {
                    //
                }
            }
        };
    }

    @Bean
    public CommandLineRunner calculateExerciseMaxWeightsRunner(
            WorkoutExerciseDao workoutExerciseDao,
            ExerciseMaxWeightDao exerciseMaxWeightDao,
            ExerciseMaxWeightService exerciseMaxWeightService) {
        return args -> {
            exerciseMaxWeightDao.deleteAll();
            List<WorkoutExercise> allExercises = workoutExerciseDao.findAll();
            Map<Long, Map<Long, Optional<Short>>> maxWeights = allExercises.stream()
                .filter(we -> we.getWeight() != null)
                .collect(Collectors.groupingBy(
                    we -> we.getWorkout().getUser().getId(),
                    Collectors.groupingBy(
                        we -> we.getRoutineExercise().getExercise().getId(),
                        Collectors.mapping(WorkoutExercise::getWeight, Collectors.maxBy(Comparator.naturalOrder()))
                    )
                ));
            for (Map.Entry<Long, Map<Long, Optional<Short>>> userEntry : maxWeights.entrySet()) {
                Long userId = userEntry.getKey();
                for (Map.Entry<Long, Optional<Short>> exerciseEntry : userEntry.getValue().entrySet()) {
                    Long exerciseId = exerciseEntry.getKey();
                    Optional<Short> maxWeightOpt = exerciseEntry.getValue();
                    if (maxWeightOpt.isPresent()) {
                        try {
                            exerciseMaxWeightService.addOrUpdateMaxWeight(userId, exerciseId, maxWeightOpt.get());
                        } catch (InstanceNotFoundException e) {
                            //
                        }
                    }
                }
            }
        };
    }
}
