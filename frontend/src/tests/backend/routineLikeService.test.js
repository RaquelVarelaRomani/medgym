import { fetchConfig } from "../../backend/appFetch";
import {
  likeRoutine,
  getRoutineLikes,
  unlikeRoutine
} from "../../backend/routineLikeService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("routineLikeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("likeRoutine", () => {
    const routineId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Liked" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      likeRoutine(routineId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error liking routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      likeRoutine(routineId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      likeRoutine(routineId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/like`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getLikes", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ routineId: 1, userId: 123 }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getRoutineLikes(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching likes" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getRoutineLikes(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getRoutineLikes(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routineLikes`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("unlikeRoutine", () => {
    const routineId = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Unliked" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      unlikeRoutine(routineId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error unliking routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      unlikeRoutine(routineId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      unlikeRoutine(routineId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/unlike`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });
});