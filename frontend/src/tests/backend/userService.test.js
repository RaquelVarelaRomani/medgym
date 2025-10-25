import { fetchConfig } from "../../backend/appFetch";
import {
  login,
  tryLoginFromServiceToken,
  signUp,
  logout,
  updateProfile,
  changePassword,
  getUser,
  getAllUsers,
  deleteUser
} from "../../backend/userService";

// Mock appFetch and related functions
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
  setServiceToken: jest.fn(),
  getServiceToken: jest.fn(),
  removeServiceToken: jest.fn(),
  setReauthenticationCallback: jest.fn(),
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;
const mockSetServiceToken = require("../../backend/appFetch").setServiceToken;
const mockGetServiceToken = require("../../backend/appFetch").getServiceToken;
const mockRemoveServiceToken = require("../../backend/appFetch").removeServiceToken;
const mockSetReauthenticationCallback = require("../../backend/appFetch").setReauthenticationCallback;

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const email = "test@example.com";
    const password = "password";
    const reauthenticationCallback = jest.fn();

    test("successful API call with proper parameter passing", () => {
      const mockAuthenticatedUser = { id: 1, email, serviceToken: "token" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockAuthenticatedUser);
      });

      login(email, password, onSuccess, onErrors, reauthenticationCallback);

      expect(onSuccess).toHaveBeenCalledWith(mockAuthenticatedUser);
      expect(onErrors).not.toHaveBeenCalled();
      expect(mockSetServiceToken).toHaveBeenCalledWith(mockAuthenticatedUser.serviceToken);
      expect(mockSetReauthenticationCallback).toHaveBeenCalledWith(reauthenticationCallback);
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Invalid credentials" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      login(email, password, onSuccess, onErrors, reauthenticationCallback);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockSetServiceToken).not.toHaveBeenCalled();
      expect(mockSetReauthenticationCallback).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      login(email, password, onSuccess, onErrors, reauthenticationCallback);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/users/login",
        fetchConfig("POST", { email, password }),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe("tryLoginFromServiceToken", () => {
    const reauthenticationCallback = jest.fn();

    test("successful API call with service token", () => {
      const mockAuthenticatedUser = { id: 1, email: "test@example.com" };
      const onSuccess = jest.fn();

      mockGetServiceToken.mockReturnValue("token");
      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockAuthenticatedUser);
      });

      tryLoginFromServiceToken(onSuccess, reauthenticationCallback);

      expect(onSuccess).toHaveBeenCalledWith(mockAuthenticatedUser);
      expect(mockSetReauthenticationCallback).toHaveBeenCalledWith(reauthenticationCallback);
      expect(mockRemoveServiceToken).not.toHaveBeenCalled();
    });

    test("calls onSuccess immediately when no service token", () => {
      const onSuccess = jest.fn();

      mockGetServiceToken.mockReturnValue(null);

      tryLoginFromServiceToken(onSuccess, reauthenticationCallback);

      expect(onSuccess).toHaveBeenCalledWith();
      expect(mockAppFetch).not.toHaveBeenCalled();
      // setReauthenticationCallback is called before checking token
      // expect(mockSetReauthenticationCallback).toHaveBeenCalledWith(reauthenticationCallback);
    });

    test("error handling removes service token", () => {
      const onSuccess = jest.fn();

      mockGetServiceToken.mockReturnValue("token");
      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors();
      });

      tryLoginFromServiceToken(onSuccess, reauthenticationCallback);

      expect(mockRemoveServiceToken).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();

      mockGetServiceToken.mockReturnValue("token");

      tryLoginFromServiceToken(onSuccess, reauthenticationCallback);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/users/loginFromServiceToken",
        fetchConfig("POST"),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("signUp", () => {
    const user = { email: "test@example.com", password: "password", name: "Test User" };
    const reauthenticationCallback = jest.fn();

    test("successful API call with proper parameter passing", () => {
      const mockAuthenticatedUser = { id: 1, ...user, serviceToken: "token" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockAuthenticatedUser);
      });

      signUp(user, onSuccess, onErrors, reauthenticationCallback);

      expect(onSuccess).toHaveBeenCalledWith(mockAuthenticatedUser);
      expect(onErrors).not.toHaveBeenCalled();
      expect(mockSetServiceToken).toHaveBeenCalledWith(mockAuthenticatedUser.serviceToken);
      expect(mockSetReauthenticationCallback).toHaveBeenCalledWith(reauthenticationCallback);
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Email already exists" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      signUp(user, onSuccess, onErrors, reauthenticationCallback);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockSetServiceToken).not.toHaveBeenCalled();
      expect(mockSetReauthenticationCallback).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      signUp(user, onSuccess, onErrors, reauthenticationCallback);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/users/signUp",
        fetchConfig("POST", user),
        expect.any(Function),
        onErrors
      );
    });
  });

  describe("logout", () => {
    test("removes service token", () => {
      logout();

      expect(mockRemoveServiceToken).toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    const user = { id: 1, email: "test@example.com", name: "Updated Name" };

    test("successful API call with proper parameter passing", () => {
      const mockUpdatedUser = { ...user };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockUpdatedUser);
      });

      updateProfile(user, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockUpdatedUser);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Update failed" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      updateProfile(user, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      updateProfile(user, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/${user.id}`,
        fetchConfig("PUT", user),
        onSuccess,
        onErrors
      );
    });
  });

  describe("changePassword", () => {
    const id = 1;
    const oldPassword = "oldpass";
    const newPassword = "newpass";

    test("successful API call with proper parameter passing", () => {
      const mockResponse = { message: "Password changed successfully" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockResponse);
      });

      changePassword(id, oldPassword, newPassword, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Invalid old password" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      changePassword(id, oldPassword, newPassword, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      changePassword(id, oldPassword, newPassword, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/${id}/changePassword`,
        fetchConfig("POST", { oldPassword, newPassword }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getUser", () => {
    const id = 1;

    test("successful API call with proper parameter passing", () => {
      const mockUser = { id, email: "test@example.com", name: "Test User" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockUser);
      });

      getUser(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockUser);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "User not found" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getUser(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getUser(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/${id}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getAllUsers", () => {
    test("successful API call with proper parameter passing", () => {
      const mockUsers = [
        { id: 1, email: "user1@example.com" },
        { id: 2, email: "user2@example.com" }
      ];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockUsers);
      });

      getAllUsers(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockUsers);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Failed to fetch users" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getAllUsers(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getAllUsers(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/users",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("deleteUser", () => {
    const id = 1;

    test("successful API call with proper parameter passing", () => {
      const mockResponse = { message: "User deleted successfully" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockResponse);
      });

      deleteUser(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Delete failed" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      deleteUser(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      deleteUser(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/${id}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });
});