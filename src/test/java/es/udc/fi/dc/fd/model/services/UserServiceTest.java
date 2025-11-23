package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {

	@Autowired
	private UserService userService;

	private User createUser(String email, String phoneNumber) {
		return new User("name", "surname", email, phoneNumber, "password", RoleType.CLIENT, User.StatusType.ACTIVE);
	}

	@Test
	void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {

		User user = createUser("user@test.com", "123456789");

		userService.signUp(user);

		User loggedInUser = userService.loginFromId(user.getId());

		assertEquals(user, loggedInUser);
		assertEquals(User.RoleType.CLIENT, user.getRole());
		assertEquals(User.StatusType.ACTIVE, user.getStatus());

	}

	@Test
	void testBlockUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

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
	void testUnblockUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {

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

    @Test
    void testSignUpDuplicateEmail() throws DuplicateInstanceException {
        User user = createUser("dup@test.com", "600111111");
        userService.signUp(user);

        User user2 = createUser("dup@test.com", "600222222");
        assertThrows(DuplicateInstanceException.class, () -> {
            userService.signUp(user2);
        });
    }

    @Test
    void testLoginIncorrectPassword() throws DuplicateInstanceException {
        User user = createUser("login@test.com", "600333333");
        userService.signUp(user);

        assertThrows(es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException.class, () -> {
            userService.login("login@test.com", "wrongpassword");
        });
    }

    @Test
    void testSetTrainerPremium_Ok() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User trainer = createUser("trainer@test.com", "600444444");
        userService.signUp(trainer);
        trainer.setRole(User.RoleType.TRAINER);

        userService.setTrainerPremium(trainer.getId(), true);

        User updatedTrainer = userService.findUserById(trainer.getId());
        assertEquals(true, updatedTrainer.getTrainerPremium());
    }

    @Test
    void testSetTrainerPremium_PermissionDenied() throws DuplicateInstanceException {
        User client = createUser("client@test.com", "600555555");
        userService.signUp(client);

        assertThrows(PermissionException.class, () -> {
            userService.setTrainerPremium(client.getId(), true);
        });
    }

    @Test
    void testSignUp_InvalidEmail() {
        User user = createUser("invalid-email", "700111111");

        assertThrows(IllegalArgumentException.class, () -> {
            userService.signUp(user);
        });
    }

    @Test
    void testSignUp_DuplicatePhone() throws DuplicateInstanceException {
        User user1 = createUser("phone1@test.com", "700222222");
        userService.signUp(user1);

        User user2 = createUser("phone2@test.com", "700222222");
        assertThrows(DuplicateInstanceException.class, () -> {
            userService.signUp(user2);
        });
    }

    @Test
    void testLogin_NonExistingEmail() {
        assertThrows(IncorrectLoginException.class, () -> {
            userService.login("nonexisting@test.com", "password");
        });
    }

    @Test
    void testLogin_BlockedUser() throws DuplicateInstanceException {
        User user = createUser("blocked@test.com", "700333333");
        userService.signUp(user);
        user.setStatus(User.StatusType.BLOCKED);

        assertThrows(BlockedUserException.class, () -> {
            userService.login("blocked@test.com", "password");
        });
    }

    @Test
    void testUpdateProfile_InvalidEmail() throws DuplicateInstanceException {
        User user = createUser("update@test.com", "700444444");
        userService.signUp(user);

        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateProfile(user.getId(), "New", "Name", "invalid-email", "+34 555 666 777", null);
        });
    }

    @Test
    void testChangePassword_IncorrectOldPassword() throws DuplicateInstanceException {
        User user = createUser("changepass@test.com", "700555555");
        userService.signUp(user);

        assertThrows(IncorrectPasswordException.class, () -> {
            userService.changePassword(user.getId(), "wrongold", "newpass");
        });
    }

    @Test
    void testFindUserById_NotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            userService.findUserById(999L);
        });
    }

    @Test
    void testBlockUser_Admin() throws DuplicateInstanceException {
        User admin = createUser("adminblock@test.com", "700666666");
        admin.setRole(User.RoleType.ADMIN);
        userService.signUp(admin);

        assertThrows(PermissionException.class, () -> {
            userService.blockUser(admin.getId(), admin.getId());
        });
    }

    @Test
    void testUnblockUser_Admin() throws DuplicateInstanceException {
        User admin = createUser("adminunblock@test.com", "700777777");
        admin.setRole(User.RoleType.ADMIN);
        userService.signUp(admin);

        assertThrows(PermissionException.class, () -> {
            userService.unblockUser(admin.getId(), admin.getId());
        });
    }

    @Test
    void testSearchUsers() throws DuplicateInstanceException {
        User user1 = createUser("search1@test.com", "700888888");
        userService.signUp(user1);

        User user2 = createUser("search2@test.com", "700999999");
        userService.signUp(user2);

        var results = userService.searchUsers(user1.getId(), "search");
        assertEquals(1, results.size());
        assertEquals(user2.getId(), results.get(0).getId());
    }

    @Test
    void testUpdateBodyMetrics_InvalidWeight() throws DuplicateInstanceException {
        User user = createUser("body@test.com", "701111111");
        userService.signUp(user);

        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateBodyMetrics(user.getId(), -10.0, 170.0, User.GenderType.MALE);
        });
    }

    @Test
    void testUpdateBodyMetrics_InvalidHeight() throws DuplicateInstanceException {
        User user = createUser("body2@test.com", "701222222");
        userService.signUp(user);

        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateBodyMetrics(user.getId(), 70.0, 0.0, User.GenderType.MALE);
        });
    }

    @Test
    void testUpdateBodyMetrics_Ok() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("body3@test.com", "701333333");
        userService.signUp(user);

        User updated = userService.updateBodyMetrics(user.getId(), 75.0, 180.0, User.GenderType.MALE);
        assertEquals(75.0, updated.getWeightKg(), 0.0);
        assertEquals(180.0, updated.getHeightCm(), 0.0);
        assertEquals(User.GenderType.MALE, updated.getGender());
    }

    @Test
    void testClearBodyMetrics() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("clear@test.com", "701444444");
        userService.signUp(user);
        userService.updateBodyMetrics(user.getId(), 70.0, 170.0, User.GenderType.FEMALE);

        User cleared = userService.clearBodyMetrics(user.getId());
        assertNull(cleared.getWeightKg());
        assertNull(cleared.getHeightCm());
        assertNull(cleared.getGender());
    }

    @Test
    void testFindAllUsers() throws DuplicateInstanceException {
        User user1 = createUser("all1@test.com", "701555555");
        userService.signUp(user1);

        User user2 = createUser("all2@test.com", "701666666");
        userService.signUp(user2);

        var all = userService.findAllUsers();
        assertTrue(all.size() >= 2);
    }

    @Test
    void testDeleteUser() throws DuplicateInstanceException {
        User user = createUser("delete@test.com", "701777777");
        userService.signUp(user);

        userService.deleteUser(user.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            userService.findUserById(user.getId());
        });
    }
}
