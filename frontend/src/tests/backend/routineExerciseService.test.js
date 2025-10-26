import { fetchConfig } from "../../backend/appFetch";
import {
  createRoutineExercise,
  getRoutineExercise,
  getRoutineExercises,
  updateRoutineExercise,
  deleteRoutineExercise
} from "../../backend/routineExerciseService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("routineExerciseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createRoutineExercise", () => {
    const routineId = 1;
    const exerciseId = 123;
    const position = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: 1, routineId, exerciseId, position };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      createRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error creating routine exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      createRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path, method, and request body", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      createRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises`,
        fetchConfig("POST", { exerciseId, position }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getRoutineExercise", () => {
    const routineId = 1;
    const exerciseId = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: exerciseId, routineId, exerciseId, position: 1 };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching routine exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises/${exerciseId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getRoutineExercises", () => {
    const routineId = 1;

    test("successful API call with single page", () => {
      const mockPageData = {
        content: [{ id: 1, exerciseId: 123, position: 1 }],
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 10,
        numberOfElements: 1,
        first: true,
        last: true
      };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockPageData);
      });

      getRoutineExercises(routineId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith({
        ...mockPageData,
        content: mockPageData.content,
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 1,
        numberOfElements: 1,
        first: true,
        last: true
      });
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("successful API call with multiple pages", () => {
      const page1Data = {
        content: [{ id: 1, exerciseId: 123, position: 1 }],
        totalPages: 2,
        totalElements: 2,
        number: 0,
        size: 1,
        numberOfElements: 1,
        first: true,
        last: false
      };
      const page2Data = {
        content: [{ id: 2, exerciseId: 456, position: 2 }],
        totalPages: 2,
        totalElements: 2,
        number: 1,
        size: 1,
        numberOfElements: 1,
        first: false,
        last: true
      };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch
        .mockImplementationOnce((url, config, success, errors) => {
          success(page1Data);
        })
        .mockImplementationOnce((url, config, success, errors) => {
          success(page2Data);
        });

      getRoutineExercises(routineId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledTimes(2);
      expect(mockAppFetch).toHaveBeenNthCalledWith(
        1,
        `/routines/${routineId}/exercises?page=0`,
        fetchConfig("GET"),
        expect.any(Function),
        onErrors
      );
      expect(mockAppFetch).toHaveBeenNthCalledWith(
        2,
        `/routines/${routineId}/exercises?page=1`,
        fetchConfig("GET"),
        expect.any(Function),
        onErrors
      );
      expect(onSuccess).toHaveBeenCalledWith({
        ...page1Data,
        content: [...page1Data.content, ...page2Data.content],
        totalPages: 1,
        totalElements: 2,
        number: 0,
        size: 2,
        numberOfElements: 2,
        first: true,
        last: true
      });
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching routine exercises" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getRoutineExercises(routineId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("updateRoutineExercise", () => {
    const routineId = 1;
    const exerciseId = 123;
    const position = 2;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: exerciseId, routineId, exerciseId, position };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      updateRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error updating routine exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      updateRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path, method, and request body", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      updateRoutineExercise(routineId, exerciseId, position, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises/${exerciseId}`,
        fetchConfig("PUT", { position }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("deleteRoutineExercise", () => {
    const routineId = 1;
    const exerciseId = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Routine exercise deleted" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      deleteRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error deleting routine exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      deleteRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      deleteRoutineExercise(routineId, exerciseId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${routineId}/exercises/${exerciseId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });
});