import { fetchConfig } from "../../backend/appFetch";
import {
  followTrainer,
  unfollowTrainer,
  getFollowers,
  getFollowedTrainers
} from "../../backend/userFollowService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("userFollowService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("followTrainer", () => {
    const trainerId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Trainer followed successfully" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      followTrainer(trainerId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error following trainer" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      followTrainer(trainerId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      followTrainer(trainerId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/follow/${trainerId}`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("unfollowTrainer", () => {
    const trainerId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Trainer unfollowed successfully" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      unfollowTrainer(trainerId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error unfollowing trainer" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      unfollowTrainer(trainerId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      unfollowTrainer(trainerId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/follow/${trainerId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getFollowers", () => {
    const trainerId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Follower 1" }, { id: 2, name: "Follower 2" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getFollowers(trainerId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching followers" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getFollowers(trainerId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getFollowers(trainerId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/follow/followers/${trainerId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getFollowedTrainers", () => {
    const userId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Trainer 1" }, { id: 2, name: "Trainer 2" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getFollowedTrainers(userId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching followed trainers" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getFollowedTrainers(userId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getFollowedTrainers(userId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/users/follow/client/${userId}/following`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });
});