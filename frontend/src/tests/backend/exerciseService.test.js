import { fetchConfig } from "../../backend/appFetch";
import {
  createExercise,
  getExercise,
  getAllExercises,
  updateExercise,
  updateExerciseStatus,
  getPendingExercises,
  deleteExercise,
  getExercisesByStatus
} from "../../backend/exerciseService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("exerciseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createExercise", () => {
    const name = "Push-up";
    const description = "A basic exercise";
    const muscleGroup = "Chest";
    const equipment = "None";
    const image = new File(["dummy"], "image.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("muscleGroup", muscleGroup);
    formData.append("equipment", equipment);
    formData.append("image", image);

    test("successful API call with proper parameter passing", () => {
      const mockData = { id: 1, name };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      createExercise(name, description, muscleGroup, equipment, image, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error creating exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      createExercise(name, description, muscleGroup, equipment, image, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

  });

  describe("getExercise", () => {
    const id = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { id, name: "Push-up" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getExercise(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getExercise(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getExercise(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/exercises/${id}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getAllExercises", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Push-up" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getAllExercises(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching exercises" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getAllExercises(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getAllExercises(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/exercises",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("updateExercise", () => {
    const id = 123;
    const name = "Push-up Updated";
    const description = "An updated exercise";
    const muscleGroup = "Chest";
    const equipment = "None";
    const image = new File(["dummy"], "image.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("muscleGroup", muscleGroup);
    formData.append("equipment", equipment);
    formData.append("image", image);

    test("successful API call with proper parameter passing", () => {
      const mockData = { id, name };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      updateExercise(id, name, description, muscleGroup, equipment, image, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error updating exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      updateExercise(id, name, description, muscleGroup, equipment, image, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

  });

  describe("updateExerciseStatus", () => {
    const id = 123;
    const status = "APPROVED";

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Status updated" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      updateExerciseStatus(id, status, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error updating status" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      updateExerciseStatus(id, status, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path, method, and request body", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      updateExerciseStatus(id, status, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/exercises/${id}/status`,
        fetchConfig("PUT", { status }),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getPendingExercises", () => {
    test("successful API call with proper parameter passing", () => {
      const mockData = [{ id: 1, name: "Pending Exercise" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getPendingExercises(onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error fetching pending exercises" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getPendingExercises(onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getPendingExercises(onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/exercises/pending",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("deleteExercise", () => {
    const id = 123;

    test("successful API call with proper parameter passing", () => {
      const mockData = { message: "Exercise deleted" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      deleteExercise(id, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const mockError = { globalError: "Error deleting exercise" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      deleteExercise(id, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with appropriate path and method", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      deleteExercise(id, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/exercises/${id}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
      );
    });
  });

  describe("getExercisesByStatus", () => {
    test("successful API call with status parameter", () => {
      const status = "APPROVED";
      const mockData = [{ id: 1, name: "Approved Exercise" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getExercisesByStatus(status, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("successful API call without status parameter", () => {
      const mockData = [{ id: 1, name: "Exercise" }];
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        success(mockData);
      });

      getExercisesByStatus(null, onSuccess, onErrors);

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onErrors).not.toHaveBeenCalled();
    });

    test("error handling with onErrors callback", () => {
      const status = "PENDING";
      const mockError = { globalError: "Error fetching exercises by status" };
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      mockAppFetch.mockImplementation((url, config, success, errors) => {
        errors(mockError);
      });

      getExercisesByStatus(status, onSuccess, onErrors);

      expect(onErrors).toHaveBeenCalledWith(mockError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    test("correct appFetch call with status query parameter", () => {
      const status = "APPROVED";
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getExercisesByStatus(status, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        `/exercises?status=${encodeURIComponent(status)}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });

    test("correct appFetch call without status query parameter", () => {
      const onSuccess = jest.fn();
      const onErrors = jest.fn();

      getExercisesByStatus(null, onSuccess, onErrors);

      expect(mockAppFetch).toHaveBeenCalledWith(
        "/exercises",
        fetchConfig("GET"),
        onSuccess,
        onErrors
      );
    });
  });
});