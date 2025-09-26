package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;

import java.util.List;

public interface UserService {
	void signUp(User user) throws DuplicateInstanceException;
	User login(String email, String password) throws IncorrectLoginException;
	User loginFromId(Long id) throws InstanceNotFoundException;
	User updateProfile(Long id, String name, String surname, String email, String phoneNumber) throws InstanceNotFoundException;
	void changePassword(Long id, String oldPassword, String newPassword) throws InstanceNotFoundException, IncorrectPasswordException;
	User findUserById(Long id) throws InstanceNotFoundException;
	List<User> findAllUsers();
	void deleteUser(Long id);
}
