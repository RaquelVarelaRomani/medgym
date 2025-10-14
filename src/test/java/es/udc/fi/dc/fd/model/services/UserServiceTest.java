package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

	@Autowired
	private UserService userService;

	private User createUser(String email, String phoneNumber) {
		return new User("name", "surname", email, phoneNumber, "password", null, RoleType.CLIENT, User.StatusType.ACTIVE);
	}

	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		User user = createUser("user@test.com", "123456789");

		userService.signUp(user);

		User loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals(User.RoleType.CLIENT, user.getRole());
		assertEquals(User.StatusType.ACTIVE, user.getStatus());

	}

	@Test
	public void testBlockUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

		User admin = createUser("admin@admin.com", "+34 222 222 222");
		admin.setRole(User.RoleType.ADMIN);
		userService.signUp(admin);

		User user = createUser("user2@user2.com", "+34 333 333 333");
		userService.signUp(user);

		userService.blockUser(admin.getId(), user.getId());

		User blockedUser = userService.findUserById(user.getId());

		assertEquals(User.StatusType.BLOCKED, blockedUser.getStatus());

	}

	@Test
	public void testUnblockUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

		User admin = createUser("admin2@admin2.com", "+34 444 444 444");
		admin.setRole(User.RoleType.ADMIN);
		userService.signUp(admin);

		User user = createUser("user3@user3.com", "+34 555 555 555");
		userService.signUp(user);

		userService.blockUser(admin.getId(), user.getId());
		userService.unblockUser(admin.getId(), user.getId());

		User unblockedUser = userService.findUserById(user.getId());

		assertEquals(User.StatusType.ACTIVE, unblockedUser.getStatus());

	}
}
