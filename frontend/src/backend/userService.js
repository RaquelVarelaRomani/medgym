import {
  fetchConfig,
  appFetch,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
  setReauthenticationCallback,
} from "./appFetch";

const processLoginSignUp = (authenticatedUser, reauthenticationCallback) => {
  setServiceToken(authenticatedUser.serviceToken);
  setReauthenticationCallback(reauthenticationCallback);
}

export const login = (email, password, onSuccess, onErrors, reauthenticationCallback) => appFetch(
    "/users/login",
    fetchConfig("POST", { email, password }),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    onErrors
  );

export const tryLoginFromServiceToken = (onSuccess, reauthenticationCallback) => {
  const serviceToken = getServiceToken();

  if (!serviceToken) {
    onSuccess();
    return;
  }

  setReauthenticationCallback(reauthenticationCallback);

  appFetch(
    "/users/loginFromServiceToken",
    fetchConfig("POST"),
    (authenticatedUser) => onSuccess(authenticatedUser),
    () => removeServiceToken()
  );
};

export const signUp = (user, onSuccess, onErrors, reauthenticationCallback) => appFetch(
    "/users/signUp",
    fetchConfig("POST", user),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    onErrors
);

export const logout = () => removeServiceToken();

export const updateProfile = (user, onSuccess, onErrors) => appFetch(
    `/users/${user.id}`,
    fetchConfig("PUT", user),
    onSuccess,
    onErrors
);

export const changePassword = (id, oldPassword, newPassword, onSuccess, onErrors) => appFetch(
    `/users/${id}/changePassword`,
    fetchConfig("POST", { oldPassword, newPassword }),
    onSuccess,
    onErrors
);

export const getUser = (id, onSuccess, onErrors) => appFetch(
    `/users/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
);

export const getAllUsers = (onSuccess, onErrors) => appFetch(
    `/users`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
);

export const deleteUser = (id, onSuccess, onErrors) => appFetch(
    `/users/${id}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
);

export const getProfilePicture = (id, onSuccess, onErrors) => appFetch(
    `/users/${id}/profilePicture`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
);