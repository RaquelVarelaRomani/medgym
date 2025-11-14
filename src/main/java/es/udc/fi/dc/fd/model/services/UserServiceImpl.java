package es.udc.fi.dc.fd.model.services;

import java.util.List;
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
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;

import es.udc.fi.dc.fd.util.EmailValidation;

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

		if (!EmailValidation.isValidEmail(user.getEmail())) {
			throw new IllegalArgumentException("Formato de email inválido");
		}
		
		if (userDao.existsByEmail(user.getEmail())) {
			throw new DuplicateInstanceException("email", user.getEmail());
		}

        if (userDao.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new DuplicateInstanceException("phoneNumber", user.getPhoneNumber());
        }

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(User.RoleType.CLIENT);

		userDao.save(user);

	}

	@Override
	@Transactional(readOnly = true)
	public User login(String email, String password) throws IncorrectLoginException, BlockedUserException {

		Optional<User> user = userDao.findByEmail(email);

		if (user.isEmpty()) {
			throw new IncorrectLoginException(email, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(email, password);
		}

		if (user.get().getStatus() == User.StatusType.BLOCKED) {
			throw new BlockedUserException(email);
		}

		return user.get();

	}

	@Override
	@Transactional(readOnly = true)
	public User loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	@Override
	public User updateProfile(Long id, String name, String surname, String email, String phoneNumber, byte[] profilePicture) throws InstanceNotFoundException {

		User user = permissionChecker.checkUser(id);

		if (!EmailValidation.isValidEmail(email)) {
			throw new IllegalArgumentException("Formato de email inválido");
		}

		user.setName(name);
		user.setSurname(surname);
		user.setEmail(email);
		user.setPhoneNumber(phoneNumber);
		user.setProfilePicture(profilePicture);

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

	@Override
	public User findUserById(Long id) throws InstanceNotFoundException {
		Optional<User> user = userDao.findById(id);
		if (user.isEmpty()) {
			throw new InstanceNotFoundException("project.entities.user", id);
		}

		return user.get();
	}

	@Override
	public List<User> findAllUsers() {
		return userDao.findAll();
	}

	@Override
	public void deleteUser(Long id) {
		userDao.deleteById(id);
	}

	@Override
	public void blockUser(Long currentUserId, Long id) throws InstanceNotFoundException, PermissionException {
		User user = permissionChecker.checkUser(id);

		if (user.getRole() == User.RoleType.ADMIN) {
			throw new PermissionException();
		}

		user.setStatus(User.StatusType.BLOCKED);
	}

	@Override
	public void unblockUser(Long currentUserId, Long id) throws InstanceNotFoundException, PermissionException {
		User user = permissionChecker.checkUser(id);

		if (user.getRole() == User.RoleType.ADMIN) {
			throw new PermissionException();
		}

		user.setStatus(User.StatusType.ACTIVE);
	}


	@Override
    public User updateBodyMetrics(Long id, Double weightKg, Double heightCm, User.GenderType gender)
            throws InstanceNotFoundException {

        User user = permissionChecker.checkUser(id);

        if (weightKg != null && weightKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser mayor que 0");
        }
        if (heightCm != null && heightCm <= 0) {
            throw new IllegalArgumentException("La altura debe ser mayor que 0");
        }

        user.setWeightKg(weightKg);
        user.setHeightCm(heightCm);
        user.setGender(gender);

        return user;
    }

    @Override
    public User clearBodyMetrics(Long id) throws InstanceNotFoundException {
        User user = permissionChecker.checkUser(id);
        user.setWeightKg(null);
        user.setHeightCm(null);
        user.setGender(null);
        return user;
    }

    @Override
    public void setTrainerPremium(Long id, boolean premium) throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(id);

        if (user.getRole() != User.RoleType.TRAINER) {
            throw new PermissionException();
        }

        user.setTrainerPremium(premium);
    }
}
