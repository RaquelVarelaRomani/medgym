import { fetchConfig } from "../../backend/appFetch";
import {
  createNewRoutineNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification
} from "../../backend/notificationService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewRoutineNotification", () => {
    const routineId = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: 1, routineId };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      createNewRoutineNotification(routineId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error creating notification" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      createNewRoutineNotification(routineId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path, method, and request body", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      createNewRoutineNotification(routineId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
              "/notifications/newRoutine",
              fetchConfig("POST", { routineId }),
              onSuccess,
              onErrors
            );
    });
  });

  describe("getUserNotifications", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, message: "Notification" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getUserNotifications(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching notifications" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getUserNotifications(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getUserNotifications(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/notifications",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("markNotificationAsRead", () => {
    const notificationId = 456;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Notification marked as read" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      markNotificationAsRead(notificationId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error marking notification as read" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      markNotificationAsRead(notificationId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      markNotificationAsRead(notificationId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/notifications/${notificationId}/read`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("deleteNotification", () => {
    const notificationId = 789;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Notification deleted" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      deleteNotification(notificationId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error deleting notification" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      deleteNotification(notificationId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      deleteNotification(notificationId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/notifications/${notificationId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });
});