package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
public class DataImageLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataImageLoader.class);
    private static final String IMAGES_PATH = "data_images/";

    private final UserDao userDao;
    private final ExerciseDao exerciseDao;

    private static final Map<String, String> USER_IMAGES = Map.of(
            "carlos.gomez@example.com", "carlos.jpg",
            "laura.martinez@example.com", "laura.jpg",
            "miguel.fernandez@example.com", "miguel.jpg",
            "sofia.lopez@example.com", "sofia.jpg",
            "ana.torres@example.com", "ana.jpg"
    );

    private static final Map<String, String> EXERCISE_IMAGES = Map.ofEntries(
            Map.entry("Sentadillas", "sentadilla.jpg"),
            Map.entry("Flexiones", "flexiones.jpg"),
            Map.entry("Burpees", "burpees.jpg"),
            Map.entry("Plancha abdominal", "plancha.jpg"),
            Map.entry("Zancadas", "zancadas.jpg"),
            Map.entry("Saltos de comba", "salto_comba.jpg"),
            Map.entry("Peso muerto", "peso_muerto.jpg"),
            Map.entry("Press banca", "press_banca.jpg"),
            Map.entry("Dominadas", "dominadas.jpg"),
            Map.entry("Mountain climbers", "mountain_climbers.jpg"),
            Map.entry("Curl de bíceps", "curl_biceps.jpg"),
            Map.entry("Extensiones de tríceps", "extensiones_triceps.jpg"),
            Map.entry("Elevaciones laterales", "elevaciones_laterales.jpg"),
            Map.entry("Elevaciones laterales 2", "elevaciones_laterales.jpg"),
            Map.entry("Remo con mancuerna", "remo_mancuerna.jpg")
    );

    public DataImageLoader(UserDao userDao, ExerciseDao exerciseDao) {
        this.userDao = userDao;
        this.exerciseDao = exerciseDao;
    }

    @Override
    @Transactional
    public void run(String... args) {
        loadUserImages();
        loadExerciseImages();
    }

    private void loadUserImages() {
        logger.info("Loading user profile images...");
        int loaded = 0;

        for (Map.Entry<String, String> entry : USER_IMAGES.entrySet()) {
            String email = entry.getKey();
            String filename = entry.getValue();

            Optional<User> userOpt = userDao.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getProfilePicture() == null) {
                    byte[] imageData = loadImage(filename);
                    if (imageData != null) {
                        user.setProfilePicture(imageData);
                        userDao.save(user);
                        loaded++;
                        logger.debug("Loaded profile image for user: {}", email);
                    }
                }
            } else {
                logger.warn("User not found for email: {}", email);
            }
        }

        logger.info("Loaded {} user profile images", loaded);
    }

    private void loadExerciseImages() {
        logger.info("Loading exercise images...");
        int loaded = 0;

        for (Map.Entry<String, String> entry : EXERCISE_IMAGES.entrySet()) {
            String exerciseName = entry.getKey();
            String filename = entry.getValue();

            Optional<Exercise> exerciseOpt = exerciseDao.findByName(exerciseName);
            if (exerciseOpt.isPresent()) {
                Exercise exercise = exerciseOpt.get();
                if (exercise.getImage() == null) {
                    byte[] imageData = loadImage(filename);
                    if (imageData != null) {
                        exercise.setImage(imageData);
                        exerciseDao.save(exercise);
                        loaded++;
                        logger.debug("Loaded image for exercise: {}", exerciseName);
                    }
                }
            } else {
                logger.warn("Exercise not found: {}", exerciseName);
            }
        }

        logger.info("Loaded {} exercise images", loaded);
    }

    private byte[] loadImage(String filename) {
        try {
            ClassPathResource resource = new ClassPathResource(IMAGES_PATH + filename);
            return resource.getInputStream().readAllBytes();
        } catch (IOException e) {
            logger.error("Failed to load image: {}", filename, e);
            return new byte[]{};
        }
    }
}
