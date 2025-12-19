import { fetchConfig } from "../../backend/appFetch";
import {
    getWeightComparison,
    getLongestStreak,
    getTopExercises,
    getFavoriteMuscleGroup,
    getFavoriteRoutine,
    getAnnualSummary
} from "../../backend/wrappedService";

// Mock appFetch
jest.mock("../../backend/appFetch", () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("wrappedService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getWeightComparison", () => {
        const year = 2025;

        test("successful API call with year parameter", () => {
            const mockData = {
                totalWeightKg: 125000,
                comparisonPhrase: "3 elefantes africanos"
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getWeightComparison(year, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("successful API call without year parameter", () => {
            const mockData = {
                totalWeightKg: 50000,
                comparisonPhrase: "un coche pequeño"
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getWeightComparison(null, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Error fetching weight comparison" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getWeightComparison(year, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe("getLongestStreak", () => {
        const year = 2025;

        test("successful API call with year parameter", () => {
            const mockData = 21;
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getLongestStreak(year, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("successful API call with zero streak", () => {
            const mockData = 0;
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getLongestStreak(year, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Error fetching longest streak" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getLongestStreak(year, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe("getAnnualSummary", () => {
        test("successful API call with complete social stats", () => {
            const mockData = {
                likesGiven: 156,
                likesReceived: 234,
                commentsGiven: 89,
                commentsReceived: 167
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getAnnualSummary(onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("successful API call with zero stats", () => {
            const mockData = {
                likesGiven: 0,
                likesReceived: 0,
                commentsGiven: 0,
                commentsReceived: 0
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockData);
            });

            getAnnualSummary(onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Error fetching annual summary" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getAnnualSummary(onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });
});