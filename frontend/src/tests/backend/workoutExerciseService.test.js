import { fetchConfig } from "../../backend/appFetch";
import {
    addWorkoutExercise,
    getWorkoutExercisesByWorkoutId
} from "../../backend/workoutExerciseService";

// Mock appFetch and related functions
jest.mock("../../backend/appFetch", () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("workoutExerciseService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("addWorkoutExercise", () => {
        const workoutId = 1;
        const reps = 10;
        const weight = 50;
        const durationSeconds = 60;
        const routineExerciseId = 2;

        test("successful API call with proper parameter passing", () => {
            const mockResponse = { id: 1, workoutId, reps, weight, durationSeconds, routineExerciseId };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockResponse);
            });

            addWorkoutExercise(workoutId, reps, weight, durationSeconds, routineExerciseId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockResponse);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to add workout exercise" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            addWorkoutExercise(workoutId, reps, weight, durationSeconds, routineExerciseId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            addWorkoutExercise(workoutId, reps, weight, durationSeconds, routineExerciseId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/${workoutId}/log`,
                fetchConfig("POST", { reps, weight, durationSeconds, routineExerciseId }),
                onSuccess,
                onErrors
            );
        });
    });

    describe("getWorkoutExercisesByWorkoutId", () => {
        const workoutId = 1;

        test("successful API call with proper parameter passing", () => {
            const mockWorkoutExercises = [
                { id: 1, workoutId, reps: 10, weight: 50 },
                { id: 2, workoutId, reps: 8, weight: 60 }
            ];
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockWorkoutExercises);
            });

            getWorkoutExercisesByWorkoutId(workoutId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockWorkoutExercises);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to fetch workout exercises" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getWorkoutExercisesByWorkoutId(workoutId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getWorkoutExercisesByWorkoutId(workoutId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/${workoutId}/log`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });
});