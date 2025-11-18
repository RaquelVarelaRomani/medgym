package es.udc.fi.dc.fd.rest.controllers;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.security.Permission;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectPasswordException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.common.ErrorsDto;
import es.udc.fi.dc.fd.rest.common.JwtGenerator;
import es.udc.fi.dc.fd.rest.common.JwtInfo;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.BmiCalculateParamsDto;
import es.udc.fi.dc.fd.rest.dtos.BmiDto;
import es.udc.fi.dc.fd.rest.dtos.BodyMetricsParamsDto;
import es.udc.fi.dc.fd.rest.dtos.ChangePasswordParamsDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.UserConversor;

import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toAuthenticatedUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUser;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDto;
import static es.udc.fi.dc.fd.rest.dtos.UserConversor.toUserDtos;
import es.udc.fi.dc.fd.rest.dtos.UserDto;
import es.udc.fi.dc.fd.model.services.UserBlockService;


@RestController
@RequestMapping("/api/users")
public class UserController {

	private static final String BLOCKED_USER_EXCEPTION_CODE = "project.exceptions.BlockedUserException";
	private static final String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";
	private static final String INCORRECT_PASS_EXCEPTION_CODE = "project.exceptions.IncorrectPasswordException";

	@Autowired
	private MessageSource messageSource;

	@Autowired
	private JwtGenerator jwtGenerator;

	@Autowired
	private UserService userService;

	@Autowired
	private UserBlockService userBlockService;

	@ExceptionHandler(IncorrectLoginException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
				INCORRECT_LOGIN_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ExceptionHandler(IncorrectPasswordException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectPasswordException(IncorrectPasswordException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_PASS_EXCEPTION_CODE, null,
				INCORRECT_PASS_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ExceptionHandler(BlockedUserException.class)
	@ResponseStatus(HttpStatus.FORBIDDEN)
	@ResponseBody
	public ErrorsDto handleBlockedUserException(BlockedUserException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(BLOCKED_USER_EXCEPTION_CODE, null,
				BLOCKED_USER_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@PostMapping("/signUp")
	public ResponseEntity<AuthenticatedUserDto> signUp(
			@Validated({ UserDto.AllValidations.class }) @RequestBody UserDto userDto)
			throws DuplicateInstanceException {

		User user = toUser(userDto);

		userService.signUp(user);

		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.getId()).toUri();

		return ResponseEntity.created(location).body(toAuthenticatedUserDto(generateServiceToken(user), user));

	}

	@PostMapping("/login")
	public AuthenticatedUserDto login(@Validated @RequestBody LoginParamsDto params) throws IncorrectLoginException, BlockedUserException {

		User user = userService.login(params.getEmail(), params.getPassword());

		return toAuthenticatedUserDto(generateServiceToken(user), user);

	}

	@PostMapping("/loginFromServiceToken")
	public AuthenticatedUserDto loginFromServiceToken(@RequestAttribute Long userId,
			@RequestAttribute String serviceToken) throws InstanceNotFoundException {

		User user = userService.loginFromId(userId);

		return toAuthenticatedUserDto(serviceToken, user);

	}

	@PutMapping("/{id}")
	public UserDto updateProfile(@RequestAttribute Long userId, @PathVariable("id") Long id,
			@Validated({ UserDto.UpdateValidations.class }) @RequestBody UserDto userDto)
			throws InstanceNotFoundException, PermissionException {

		if (!id.equals(userId)) {
			throw new PermissionException();
		}

		return toUserDto(userService.updateProfile(id, userDto.getName(), userDto.getSurname(), userDto.getEmail(), userDto.getPhoneNumber(), userDto.getProfilePicture()));

	}

	@PostMapping("/{id}/changePassword")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@RequestAttribute Long userId, @PathVariable Long id,
			@Validated @RequestBody ChangePasswordParamsDto params)
			throws PermissionException, InstanceNotFoundException, IncorrectPasswordException {

		if (!id.equals(userId)) {
			throw new PermissionException();
		}

		userService.changePassword(id, params.getOldPassword(), params.getNewPassword());

	}

	private String generateServiceToken(User user) {

		JwtInfo jwtInfo = new JwtInfo(user.getId(), user.getEmail(), user.getRole().toString(), user.getStatus().toString());

		return jwtGenerator.generate(jwtInfo);

	}

	@GetMapping("/{id}")
	public UserDto getUser(@PathVariable Long id, @RequestAttribute Long userId) throws InstanceNotFoundException, PermissionException {

		// No se aplica bloqueo cuando pides tu propio perfil
		if (!userId.equals(id) && userBlockService.hasBlocked(id, userId)) {
			throw new PermissionException();
		}

		return toUserDto(userService.findUserById(id));
	}

	@GetMapping
	public List<UserDto> getAllUsers(@RequestAttribute Long userId) {

		return userService.findAllUsers().stream()
			.filter(u -> !userBlockService.hasBlocked(u.getId(), userId)) // si ELLOS me bloquearon → no los veo
			.map(UserConversor::toUserDto)
			.toList();
	}

	@GetMapping("/search")
	public List<UserDto> searchUsers(@RequestAttribute Long userId, @RequestParam("q") String query) {
		return userService.searchUsers(userId, query).stream()
            .filter(u -> !userBlockService.hasBlocked(u.getId(), userId))
            .map(UserConversor::toUserDto)
            .toList();
	}

	@DeleteMapping("/{id}")
	public void deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
	}

	@PutMapping("/{id}/bodyMetrics")
    public UserDto updateBodyMetrics(
            @RequestAttribute Long userId,
            @PathVariable("id") Long id,
            @RequestBody BodyMetricsParamsDto params
    ) throws InstanceNotFoundException, PermissionException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        User.GenderType gender = null;
        if (params.getGender() != null && !params.getGender().isBlank()) {
            try {
                gender = User.GenderType.valueOf(params.getGender());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Género inválido. Usa: MALE, FEMALE, OTHER, UNSPECIFIED");
            }
        }

        var user = userService.updateBodyMetrics(id, params.getWeightKg(), params.getHeightCm(), gender);
        return toUserDto(user);
    }

    @DeleteMapping("/{id}/bodyMetrics")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearBodyMetrics(
            @RequestAttribute Long userId,
            @PathVariable("id") Long id
    ) throws InstanceNotFoundException, PermissionException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        userService.clearBodyMetrics(id);
    }

    @PostMapping("/{id}/bmi/calculate")
    public BmiDto calculateBmi(
            @RequestAttribute Long userId,
            @PathVariable("id") Long id,
            @RequestBody BmiCalculateParamsDto params
    ) throws PermissionException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        if (params.getWeightKg() == null || params.getHeightCm() == null || params.getHeightCm() <= 0) {
            throw new IllegalArgumentException("Para calcular IMC envía weightKg y heightCm > 0");
        }

        double hMeters = params.getHeightCm() / 100.0;
        double raw = params.getWeightKg() / (hMeters * hMeters);
        double bmi = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP).doubleValue();

        return new BmiDto(bmi);
    }

    @PutMapping("/{id}/premium")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setTrainerPremium(@RequestAttribute Long userId, @PathVariable Long id)
            throws PermissionException, InstanceNotFoundException {

        if (!id.equals(userId)) {
            throw new PermissionException();
        }

        userService.setTrainerPremium(id, true);
    }
}
