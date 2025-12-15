import { fetchConfig } from "../../backend/appFetch";
import { getAnnualSummary } from "../../backend/summaryService";

jest.mock("../../backend/appFetch", () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.requireActual("../../backend/appFetch").fetchConfig,
}));

const mockAppFetch = require("../../backend/appFetch").appFetch;

describe("summaryService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAnnualSummary", () => {
        test("successful API call with proper parameter passing", () => {
            const mockSummaryData = {
                likesGiven: 10,
                likesReceived: 5,
                commentsGiven: 3,
                commentsReceived: 8
            };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                success(mockSummaryData);
            });

            getAnnualSummary(onSuccess, onErrors);

            expect(onSuccess).toHaveBeenCalledWith(mockSummaryData);
            expect(onErrors).not.toHaveBeenCalled();
        });

        test("error handling with onErrors callback", () => {
            const mockError = { globalError: "Failed to fetch summary" };
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            mockAppFetch.mockImplementation((url, config, success, errors) => {
                errors(mockError);
            });

            getAnnualSummary(onSuccess, onErrors);

            expect(onErrors).toHaveBeenCalledWith(mockError);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        test("correct appFetch call with appropriate path and method", () => {
            const onSuccess = jest.fn();
            const onErrors = jest.fn();

            getAnnualSummary(onSuccess, onErrors);

            expect(mockAppFetch).toHaveBeenCalledWith(
                `/summary/annual`,
                fetchConfig("GET"),
                onSuccess,
                onErrors
            );
        });
    });
});