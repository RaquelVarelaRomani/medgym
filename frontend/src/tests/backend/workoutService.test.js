import { fetchConfig } from "../../backend/appFetch";
import {
    startWorkout,
    finishWorkout,
    getWorkout,
    getWorkouts,
    addWorkoutExercise,
    getWorkoutExercisesByWorkoutId, getStatsForMonth
} from "../../backend/workoutService";

// Mock appFetch and related functions
jest.mock("../../backend/appFetch", () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("workoutService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("startWorkout", () => {
        const routineId = 1;

        test("successful API call with proper parameter passing", () => {
            const mockResponse = { id: 1, routineId };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockResponse);
            });

            startWorkout(routineId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockResponse);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to start workout" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            startWorkout(routineId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            startWorkout(routineId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/start`,
                fetchConfig("POST", { routineId }),
                onSuccess,
                onErrors
            );
        });
    });

    describe("finishWorkout", () => {
        const workoutId = 1;

        test("successful API call with proper parameter passing", () => {
            const mockResponse = { id: workoutId, finished: true };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockResponse);
            });

            finishWorkout(workoutId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockResponse);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to finish workout" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            finishWorkout(workoutId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            finishWorkout(workoutId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/${workoutId}/finish`,
                fetchConfig("PUT"),
                onSuccess,
                onErrors
            );
        });
    });

    describe("getWorkout", () => {
        const workoutId = 1;

        test("successful API call with proper parameter passing", () => {
            const mockWorkout = { id: workoutId, routineId: 2 };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockWorkout);
            });

            getWorkout(workoutId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockWorkout);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to get workout" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getWorkout(workoutId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getWorkout(workoutId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/${workoutId}`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });

    describe("getWorkouts", () => {
        test("successful API call with proper parameter passing", () => {
            const mockWorkouts = [
                { id: 1, routineId: 2 },
                { id: 2, routineId: 3 }
            ];
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockWorkouts);
            });

            getWorkouts(onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockWorkouts);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to get workouts" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getWorkouts(onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getWorkouts(onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });

    describe("addWorkoutExercise", () => {
        const workoutId = 1;
        const routineExerciseId = 2;
        const reps = 10;
        const weight = 50;
        const durationSeconds = 60;

        test("successful API call with proper parameter passing", () => {
            const mockResponse = { id: 1, workoutId, routineExerciseId, reps, weight, durationSeconds };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockResponse);
            });

            addWorkoutExercise(workoutId, routineExerciseId, reps, weight, durationSeconds, onSuccess, onErrors);

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

            addWorkoutExercise(workoutId, routineExerciseId, reps, weight, durationSeconds, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            addWorkoutExercise(workoutId, routineExerciseId, reps, weight, durationSeconds, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/${workoutId}/log`,
                fetchConfig("POST", { routineExerciseId, reps, weight, durationSeconds }),
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

    describe("getStatsForMonth", () => {
        const month = 11;
        const year = 2025;

        test("successful API call with proper parameter passing", () => {
            const mockStats = {
                lastMonthWorkouts: 5,
                totalDurationSeconds: 18000,
                averageDurationSeconds: 3600,
                exercisesByMuscleGroup: {
                    CHEST: 12,
                    BACK: 10,
                    LEGS: 8,
                    ARMS: 6
                }
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockStats);
            });

            getStatsForMonth(month, year, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockStats);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to load statistics" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getStatsForMonth(month, year, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getStatsForMonth(month, year, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/stats?month=${month}&year=${year}`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });

        test("correct appFetch call with different month and year", () => {
            const differentMonth = 5;
            const differentYear = 2024;
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getStatsForMonth(differentMonth, differentYear, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/workouts/stats?month=${differentMonth}&year=${differentYear}`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });

        test("handles empty statistics response", () => {
            const mockEmptyStats = {
                lastMonthWorkouts: 0,
                totalDurationSeconds: 0,
                averageDurationSeconds: 0,
                exercisesByMuscleGroup: {}
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockEmptyStats);
            });

            getStatsForMonth(month, year, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockEmptyStats);
            expect(onErrors).not.toHaveBeenCalled();
        });
    });
});