package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface UserService {
	void signUp(User user) throws DuplicateInstanceException;
	User login(String email, String password) throws IncorrectLoginException, BlockedUserException;
	User loginFromId(Long id) throws InstanceNotFoundException;
	User updateProfile(Long id, String name, String surname, String email, String phoneNumber, byte[] profilePicture) throws InstanceNotFoundException;
	void changePassword(Long id, String oldPassword, String newPassword) throws InstanceNotFoundException, IncorrectPasswordException;
	User findUserById(Long id) throws InstanceNotFoundException;
	List<User> findAllUsers();
	void deleteUser(Long id);
	void blockUser(Long currentUserId, Long id) throws InstanceNotFoundException, PermissionException;
	void unblockUser(Long currentUserId, Long id) throws InstanceNotFoundException, PermissionException;
	List<User> searchUsers(Long currentUserId, String query);
	User updateBodyMetrics(Long id, Double weightKg, Double heightCm, User.GenderType gender) throws InstanceNotFoundException;
    User clearBodyMetrics(Long id) throws InstanceNotFoundException;
}
