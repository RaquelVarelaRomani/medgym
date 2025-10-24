import { fetchConfig } from "../../backend/appFetch";
import {
  createRoutine,
  getRoutine,
  getAllRoutines,
  getFilteredRoutines,
  updateRoutine,
  deleteRoutine
} from "../../backend/routineService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("routineService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createRoutine", () => {
    const name = "Test Routine";
    const description = "A test routine";
    const trainerId = 1;
    const visibility = "public";
    const difficulty = "beginner";

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: 1, name, description, trainerId, visibility, difficulty };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      createRoutine(name, description, trainerId, visibility, difficulty, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error creating routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      createRoutine(name, description, trainerId, visibility, difficulty, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      createRoutine(name, description, trainerId, visibility, difficulty, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines`,
        fetchConfig("POST", { name, description, trainerId, visibility, difficulty }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getRoutine", () => {
    const id = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id, name: "Test Routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getRoutine(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getRoutine(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getRoutine(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${id}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getAllRoutines", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Routine 1" }, { id: 2, name: "Routine 2" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getAllRoutines(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching routines" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getAllRoutines(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getAllRoutines(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getFilteredRoutines", () => {
    const muscleGroup = "chest";
    const equipment = "dumbbells";
    const difficulty = "intermediate";
    const trainerId = 2;

    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Filtered Routine" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getFilteredRoutines(muscleGroup, equipment, difficulty, trainerId, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching filtered routines" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getFilteredRoutines(muscleGroup, equipment, difficulty, trainerId, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method and query params", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getFilteredRoutines(muscleGroup, equipment, difficulty, trainerId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/filter?equipment=${equipment}&muscleGroup=${muscleGroup}&difficulty=${difficulty}&trainerId=${trainerId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });

    test("correct appFetch call with partial query params", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getFilteredRoutines(null, equipment, null, trainerId, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/filter?equipment=${equipment}&trainerId=${trainerId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });

    test("correct appFetch call with no query params", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getFilteredRoutines(null, null, null, null, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/filter`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("updateRoutine", () => {
    const id = 1;
    const name = "Updated Routine";
    const description = "Updated description";
    const visibility = "private";
    const difficulty = "advanced";

    test("successful API call with proper parameter passing", () => {
      const mockData = { id, name, description, visibility, difficulty };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      updateRoutine(id, name, description, visibility, difficulty, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error updating routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      updateRoutine(id, name, description, visibility, difficulty, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      updateRoutine(id, name, description, visibility, difficulty, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${id}`,
        fetchConfig("PUT", { name, description, visibility, difficulty }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("deleteRoutine", () => {
    const id = 1;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Routine deleted" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      deleteRoutine(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error deleting routine" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      deleteRoutine(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      deleteRoutine(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/routines/${id}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });
});