package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserFollowServiceTest {
    @Autowired
    private UserFollowService userFollowService;
    @Autowired
    private UserService userService;

    @Test
    public void testFollowTrainer() throws InstanceNotFoundException {
        User trainer = userService.loginFromId(0L);
        User user = userService.loginFromId(1L);
        System.out.println(trainer);
        System.out.println(user);

    }
}
