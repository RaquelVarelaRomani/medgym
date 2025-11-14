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

export const updateBodyMetrics = (id, body, onSuccess, onErrors) => appFetch(
  `/users/${id}/bodyMetrics`,
  fetchConfig("PUT", {
    weightKg: body?.weightKg ?? null,
    heightCm: body?.heightCm ?? null,
    gender: body?.gender ?? null
  }),
  onSuccess,
  onErrors
);

export const clearBodyMetrics = (id, onSuccess, onErrors) => appFetch(
  `/users/${id}/bodyMetrics`,
  fetchConfig("DELETE"),
  onSuccess,
  onErrors
);

export const becomePremium = (id, onSuccess, onErrors) => appFetch(
  `/users/${id}/premium`,
  fetchConfig("PUT"),
  onSuccess,
  onErrors
);
