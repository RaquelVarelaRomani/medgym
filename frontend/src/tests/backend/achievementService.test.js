import { fetchConfig } from "../../backend/appFetch";
import {
    createOrUpdateAchievementProgress,
    onFinishWorkoutAchievements,
    getAchievementProgress,
    getAllAchievementProgresses
} from "../../backend/achievementService";

jest.mock("../../backend/appFetch", () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("achievementService", () => {

    beforeEach(() => jest.clearAllMocks());

    describe("createOrUpdateAchievementProgress", () => {
        const achievementId = 10;
        const progress = 50;

        test("successful call", () => {
            const mockData = { ok: true };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s) => s(mockData));

            createOrUpdateAchievementProgress(achievementId, progress, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error callback", () => {
            const mockErr = { error: "fail" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s, e) => e(mockErr));

            createOrUpdateAchievementProgress(achievementId, progress, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockErr);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            createOrUpdateAchievementProgress(achievementId, progress, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/achievements/${achievementId}/progress`,
                fetchConfig("POST", { progress }),
                onSuccess,
                onErrors
            );
        });
    });

    describe("onFinishWorkoutAchievements", () => {
        const seconds = 1200;
        const reps = 30;

        test("successful call", () => {
            const mockData = { ok: true };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s) => s(mockData));

            onFinishWorkoutAchievements(seconds, reps, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error callback", () => {
            const mockErr = { error: "fail2" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s, e) => e(mockErr));

            onFinishWorkoutAchievements(seconds, reps, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockErr);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            onFinishWorkoutAchievements(seconds, reps, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/achievements/onFinishWorkout`,
                fetchConfig("POST", { seconds, reps }),
                onSuccess,
                onErrors
            );
        });
    });

    describe("getAchievementProgress", () => {
        const achievementId = 3;

        test("successful call", () => {
            const mockData = { progress: 55 };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s) => s(mockData));

            getAchievementProgress(achievementId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error callback", () => {
            const mockErr = { error: "not found" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s, e) => e(mockErr));

            getAchievementProgress(achievementId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockErr);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getAchievementProgress(achievementId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/achievements/${achievementId}`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });

    describe("getAllAchievementProgresses", () => {
        const userId = 5;

        test("successful call", () => {
            const mockData = [{ id: 1, progress: 20 }];
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s) => s(mockData));

            getAllAchievementProgresses(userId, onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error callback", () => {
            const mockErr = { error: "error load" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((u, c, s, e) => e(mockErr));

            getAllAchievementProgresses(userId, onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockErr);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getAllAchievementProgresses(userId, onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/achievements/user/${userId}`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });
});
