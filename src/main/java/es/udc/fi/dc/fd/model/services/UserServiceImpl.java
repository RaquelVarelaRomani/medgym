package es.udc.fi.dc.fd.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;

@Service
@Transactional
public class UserServiceImpl implements UserService {

	@Autowired
	private PermissionChecker permissionChecker;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private UserDao userDao;

	@Override
	public void signUp(User user) throws DuplicateInstanceException {

		if (userDao.existsByEmail(user.getEmail())) {
			throw new DuplicateInstanceException("project.entities.user", user.getEmail());
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(User.RoleType.CLIENT);

		userDao.save(user);

	}

	@Override
	@Transactional(readOnly = true)
	public User login(String email, String password) throws IncorrectLoginException {

		Optional<User> user = userDao.findByEmail(email);

		if (user.isEmpty()) {
			throw new IncorrectLoginException(email, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(email, password);
		}

		return user.get();

	}

	@Override
	@Transactional(readOnly = true)
	public User loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	@Override
	public User updateProfile(Long id, String name, String surname, String email, String phoneNumber) throws InstanceNotFoundException {

		User user = permissionChecker.checkUser(id);

		user.setName(name);
		user.setSurname(surname);
		user.setEmail(email);
		user.setPhoneNumber(phoneNumber);

		return user;

	}

	@Override
	public void changePassword(Long id, String oldPassword, String newPassword)
			throws InstanceNotFoundException, IncorrectPasswordException {

		User user = permissionChecker.checkUser(id);

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		} else {
			user.setPassword(passwordEncoder.encode(newPassword));
		}

	}

}
