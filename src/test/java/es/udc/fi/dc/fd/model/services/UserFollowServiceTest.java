package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.UserFollow;
import es.udc.fi.dc.fd.model.entities.UserFollowDao;
import es.udc.fi.dc.fd.model.services.exceptions.FollowException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserFollowServiceTest {
    @Autowired
    private UserFollowService userFollowService;
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserFollowDao userFollowDao;

    private User createTrainer(){
        User trainer = new User("Pepe", "Domingo", "hola@emeail.com",
                "666555444", "password", null, User.RoleType.TRAINER, User.StatusType.ACTIVE);
        return userDao.save(trainer);
    }

    private User createUser(){
        User trainer = new User("Pepe", "Domingo", "hola2@emeail.com",
                "666585444", "password", null, User.RoleType.CLIENT, User.StatusType.ACTIVE);
        return userDao.save(trainer);
    }

    @Test
    public void testFollowTrainer() throws InstanceNotFoundException, IncorrectLoginException {
        User user = createUser();
        User trainer = createTrainer();

        UserFollow userFollow = userFollowService.followUser(user.getId(), trainer.getId());
        UserFollow userFollow1 = userFollowDao.findByUserAndFollowUser(user, trainer).get();

        assertEquals(userFollow1, userFollow);
    }

    /*
    @Test
    public void testFollowClient() throws InstanceNotFoundException, IncorrectLoginException {
        User user = createUser();

        assertThrows(FollowException.class, () -> {
            userFollowService.followUser(user.getId(), user.getId());
        });
    }
     */

    @Test
    public void testUnfollowTrainer() throws InstanceNotFoundException, IncorrectLoginException {
        User user = createUser();
        User trainer = createTrainer();

        userFollowService.followUser(user.getId(), trainer.getId());
        userFollowService.unfollowUser(user.getId(), trainer.getId());

        assertFalse(userFollowDao.existsByUserAndFollowUser(user, trainer));
    }

    @Test
    public void testUnfollowedTrainer() throws InstanceNotFoundException, IncorrectLoginException {
        User user = createUser();
        User trainer = createTrainer();

        assertThrows(FollowException.class, () -> {
            userFollowService.unfollowUser(user.getId(), trainer.getId());
        });
    }

    @Test
    public void testFollowTheirself() throws InstanceNotFoundException, IncorrectLoginException {
        User trainer = createTrainer();

        assertThrows(FollowException.class, () -> {
            userFollowService.followUser(trainer.getId(), trainer.getId());
        });
    }

    @Test
    public void testGetFollowersNonExistentTrainer() {
        assertThrows(InstanceNotFoundException.class, () -> {
            userFollowService.getFollowers(999L);
        });
    }

    @Test
    public void testGetFollowedTrainersNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            userFollowService.getFollowedUsers(999L);
        });
    }
}
