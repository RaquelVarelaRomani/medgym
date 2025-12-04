package es.udc.fi.dc.fd;

import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.AchievementProgressService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@SpringBootApplication
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
            System.out.println("Recalculating achievement progress for all users...");
            userDao.findAll().forEach(user -> {
                try {
                    achievementProgressService.recalculateAchievementProgressForUser(user.getId());
                    System.out.println("Recalculated achievements for user: " + user.getName());
                } catch (Exception e) {
                    System.err.println("Error recalculating achievements for user " + user.getId() + ": " + e.getMessage());
                }
            });
            System.out.println("Achievement progress recalculation completed.");
        };
    }

}
