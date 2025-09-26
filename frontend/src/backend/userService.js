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

  //Guardamos el usuario en el localStorage
  localStorage.setItem("user", JSON.stringify(authenticatedUser));
  localStorage.setItem("userId", authenticatedUser.id); 
}

export const login = (
  email,
  password,
  onSuccess,
  onErrors,
  reauthenticationCallback
) =>
  appFetch(
    "/users/login",
    fetchConfig("POST", { email, password }),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    onErrors
  );

export const tryLoginFromServiceToken = (
  onSuccess,
  reauthenticationCallback
) => {
  const serviceToken = getServiceToken();

  if (!serviceToken) {
    onSuccess();
    return;
  }

  setReauthenticationCallback(reauthenticationCallback);

  appFetch(
    "/users/loginFromServiceToken",
    fetchConfig("POST"),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    () => removeServiceToken()
  );
};

export const signUp = (user, onSuccess, onErrors, reauthenticationCallback) => 
  appFetch(
    "/users/signUp",
    fetchConfig("POST", user),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    onErrors
  );

export const logout = () => {
  removeServiceToken();
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
}

/*
export const getProfile = (id, onSuccess, onErrors) =>
  appFetch(`/users/${id}`, fetchConfig("GET"), onSuccess, onErrors);
*/

export const updateProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("PUT", user), onSuccess, onErrors);

export const changePassword = (
  id,
  oldPassword,
  newPassword,
  onSuccess,
  onErrors
) =>
  appFetch(
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