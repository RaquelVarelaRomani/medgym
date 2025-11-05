import { fetchConfig } from "../../backend/appFetch";
import { getAllUsers, blockUser, unblockUser } from "../../backend/adminService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("adminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "User1" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getAllUsers(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching users" };
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
        "/admin/users",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("blockUser", () => {
    const userId = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "User blocked" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      blockUser(userId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error blocking user" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      blockUser(userId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      blockUser(userId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/admin/users/${userId}/block`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("unblockUser", () => {
    const userId = 456;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "User unblocked" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      unblockUser(userId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error unblocking user" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      unblockUser(userId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      unblockUser(userId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/admin/users/${userId}/unblock`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
      );
    });
  });
});