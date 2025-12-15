import React from 'react';
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AnnualSummaryCard from "../../modules/app/components/users/AnnualSummaryCard";
import * as summaryService from "../../backend/summaryService";
import '@testing-library/jest-dom';

jest.mock("../../backend/summaryService");

jest.mock("../../modules/app/components/users/AnnualSummaryCard.module.css", () => ({
    wrapper: "wrapper",
    card: "card",
    title: "title",
    intro: "intro",
    listContainer: "listContainer",
    section: "section",
    label: "label",
    number: "number",
    message: "message",
    footer: "footer",
    actions: "actions",
    closeBtn: "closeBtn"
}));

describe("AnnualSummaryCard", () => {
    
    test("renders positive messages when user has activity", async () => {
        const mockData = {
            likesGiven: 10,
            likesReceived: 10,
            commentsGiven: 5,
            commentsReceived: 5
        };

        summaryService.getAnnualSummary.mockImplementation((onSuccess) => onSuccess(mockData));

        render(<AnnualSummaryCard onClose={jest.fn()} />);

        await waitFor(() => {
            const likesText = screen.getAllByText("10 me gustas");
            expect(likesText.length).toBeGreaterThan(0);
            
            expect(screen.getByText(/Esperamos que este año sigas repartiendo mucho amor/i)).toBeInTheDocument();
            expect(screen.getByText(/Nos encanta la gente sociable/i)).toBeInTheDocument();
        });
    });

    test("renders encouraging messages when user has NO activity", async () => {
        const mockData = {
            likesGiven: 0,
            likesReceived: 0,
            commentsGiven: 0,
            commentsReceived: 0
        };

        summaryService.getAnnualSummary.mockImplementation((onSuccess) => onSuccess(mockData));

        render(<AnnualSummaryCard onClose={jest.fn()} />);

        await waitFor(() => {
            const zeroLikes = screen.getAllByText("0 me gustas");
            expect(zeroLikes.length).toBeGreaterThan(0); 

            const zeroComments = screen.getAllByText("0 veces");
            expect(zeroComments.length).toBeGreaterThan(0);

            expect(screen.getByText(/Con que eres de esos que quiere pasar desapercibido/i)).toBeInTheDocument();
            expect(screen.getByText(/te ha comido la lengua el gato/i)).toBeInTheDocument();
        });
    });

    test("calls onClose when close button is clicked", async () => {
        const mockData = { likesGiven: 0, likesReceived: 0, commentsGiven: 0, commentsReceived: 0 };
        summaryService.getAnnualSummary.mockImplementation((onSuccess) => onSuccess(mockData));
        
        const handleClose = jest.fn();
        render(<AnnualSummaryCard onClose={handleClose} />);

        await waitFor(() => {
            const btn = screen.getByText("Cerrar");
            fireEvent.click(btn);
        });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});