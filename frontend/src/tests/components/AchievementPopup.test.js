import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AchievementPopup from '../../modules/app/components/common/popup/AchievementPopup';
import "@testing-library/jest-dom";

describe('AchievementPopup', () => {
    const mockOnOk = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders single achievement with description and bronze req', () => {
        const achievement = {
            id: 1,
            name: 'Test Badge',
            description: 'Test Description',
            progress: 5,
            bronzeReq: 5,
            silverReq: 10,
            goldReq: 20
        };

        render(<AchievementPopup show={true} achievements={[achievement]} onOk={mockOnOk} />);

        expect(screen.getByText('¡Nueva medalla desbloqueada: Test Badge!')).toBeInTheDocument();
        expect(screen.getByText('Test Description (5)')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('medal-bronze.svg'));
    });

    test('renders single achievement with silver req', () => {
        const achievement = {
            id: 1,
            name: 'Test Badge',
            description: 'Test Description',
            progress: 12,
            bronzeReq: 5,
            silverReq: 10,
            goldReq: 20
        };

        render(<AchievementPopup show={true} achievements={[achievement]} onOk={mockOnOk} />);

        expect(screen.getByText('Test Description (10)')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('medal-silver.svg'));
    });

    test('renders single achievement with gold req', () => {
        const achievement = {
            id: 1,
            name: 'Test Badge',
            description: 'Test Description',
            progress: 25,
            bronzeReq: 5,
            silverReq: 10,
            goldReq: 20
        };

        render(<AchievementPopup show={true} achievements={[achievement]} onOk={mockOnOk} />);

        expect(screen.getByText('Test Description (20)')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('medal-gold.svg'));
    });

    test('calls onOk when button is clicked', () => {
        const achievement = {
            id: 1,
            name: 'Test Badge',
            description: 'Test Description',
            progress: 5,
            bronzeReq: 5,
            silverReq: 10,
            goldReq: 20
        };

        render(<AchievementPopup show={true} achievements={[achievement]} onOk={mockOnOk} />);

        fireEvent.click(screen.getByText('OK'));
        expect(mockOnOk).toHaveBeenCalledTimes(1);
    });

    test('does not render if show is false', () => {
        render(<AchievementPopup show={false} achievements={[]} onOk={mockOnOk} />);
        expect(screen.queryByText(/Test Badge/)).not.toBeInTheDocument();
    });

});
