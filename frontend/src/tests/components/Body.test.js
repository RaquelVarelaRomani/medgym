import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import Body from '../../modules/app/components/Body';

jest.mock('../../modules/app/components/users/Register', () => () => <div data-testid="register">Register</div>);
jest.mock('../../modules/app/components/users/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../../modules/app/components/users/Profile', () => () => <div data-testid="profile">Profile</div>);
jest.mock('../../modules/app/components/users/EditProfile', () => ({ isPasswordMode }) => <div data-testid="edit-profile">{isPasswordMode ? 'Password' : 'Profile'}</div>);
jest.mock('../../modules/app/components/routines/Routines', () => () => <div data-testid="routines">Routines</div>);
jest.mock('../../modules/app/components/routines/RoutineDetails', () => () => <div data-testid="routine-details">RoutineDetails</div>);
jest.mock('../../modules/app/components/routines/CreateRoutine', () => () => <div data-testid="create-routine">CreateRoutine</div>);
jest.mock('../../modules/app/components/routines/Exercises', () => () => <div data-testid="exercises">Exercises</div>);
jest.mock('../../modules/app/components/routines/CreateExercise', () => () => <div data-testid="create-exercise">CreateExercise</div>);
jest.mock('../../modules/app/components/routines/ExerciseDetails', () => () => <div data-testid="exercise-details">ExerciseDetails</div>);
jest.mock('../../modules/app/components/routines/EditExercise', () => () => <div data-testid="edit-exercise">EditExercise</div>);
jest.mock('../../modules/app/components/routines/EditRoutine', () => () => <div data-testid="edit-routine">EditRoutine</div>);
jest.mock('../../modules/app/components/common/RequiresLogin', () => {
  const { Outlet } = require('react-router-dom');
  const MockRequiresLogin = () => <div data-testid="requires-login"><Outlet /></div>;
  return MockRequiresLogin;
});
jest.mock('../../modules/app/components/common/RequiresLogout', () => {
  const { Outlet } = require('react-router-dom');
  const MockRequiresLogout = () => <div data-testid="requires-logout"><Outlet /></div>;
  return MockRequiresLogout;
});
jest.mock('../../modules/app/components/Layout', () => ({ children }) => <div data-testid="layout">{children}</div>);
jest.mock('../../modules/app/components/users/UserModeration', () => () => <div data-testid="user-moderation">UserModeration</div>);
jest.mock('../../modules/app/components/workouts/WorkoutHistory', () => () => <div data-testid="workout-history">WorkoutHistory</div>);
jest.mock('../../modules/app/components/workouts/WorkoutDetails', () => () => <div data-testid="workout-details">WorkoutDetails</div>);
jest.mock('../../modules/app/components/users/FollowersPage', () => () => <div data-testid="followers-page">FollowersPage</div>);
jest.mock('../../modules/app/components/workouts/WorkoutSession', () => () => <div data-testid="workout-session">WorkoutSession</div>);

describe('Body Component', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Body />
      </MemoryRouter>
    );
  };

  test('renders without crashing', () => {
    expect(() => renderWithRouter()).not.toThrow();
  });

  test('redirects root path to /users/login', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  test('renders Register component for /users/register', () => {
    renderWithRouter(['/users/register']);
    expect(screen.getByTestId('register')).toBeInTheDocument();
  });

  test('renders Login component for /users/login', () => {
    renderWithRouter(['/users/login']);
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  test('renders Routines component for /routines', () => {
    renderWithRouter(['/routines']);
    expect(screen.getByTestId('routines')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders CreateRoutine component for /routines/new', () => {
    renderWithRouter(['/routines/new']);
    expect(screen.getByTestId('create-routine')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders EditRoutine component for /routines/edit/:id', () => {
    renderWithRouter(['/routines/edit/1']);
    expect(screen.getByTestId('edit-routine')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders RoutineDetails component for /routines/:id', () => {
    renderWithRouter(['/routines/1']);
    expect(screen.getByTestId('routine-details')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders Exercises component for /exercises', () => {
    renderWithRouter(['/exercises']);
    expect(screen.getByTestId('exercises')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders CreateExercise component for /exercises/new', () => {
    renderWithRouter(['/exercises/new']);
    expect(screen.getByTestId('create-exercise')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders EditExercise component for /exercises/edit/:id', () => {
    renderWithRouter(['/exercises/edit/1']);
    expect(screen.getByTestId('edit-exercise')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders ExerciseDetails component for /exercises/:id', () => {
    renderWithRouter(['/exercises/1']);
    expect(screen.getByTestId('exercise-details')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders FollowersPage component for /users/followers', () => {
    renderWithRouter(['/users/followers']);
    expect(screen.getByTestId('followers-page')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders Profile component for /users/profile', () => {
    renderWithRouter(['/users/profile']);
    expect(screen.getByTestId('profile')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders EditProfile component for /users/profile/edit-profile in profile mode', () => {
    renderWithRouter(['/users/profile/edit-profile']);
    expect(screen.getByTestId('edit-profile')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('renders EditProfile component for /users/profile/change-password in password mode', () => {
    renderWithRouter(['/users/profile/change-password']);
    expect(screen.getByTestId('edit-profile')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  test('renders UserModeration component for /users/moderation', () => {
    renderWithRouter(['/users/moderation']);
    expect(screen.getByTestId('user-moderation')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders WorkoutHistory component for /workouts/history', () => {
    renderWithRouter(['/workouts/history']);
    expect(screen.getByTestId('workout-history')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders WorkoutDetails component for /workouts/:id', () => {
    renderWithRouter(['/workouts/1']);
    expect(screen.getByTestId('workout-details')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders WorkoutSession component for /workouts/session/:sessionId', () => {
    renderWithRouter(['/workouts/session/1']);
    expect(screen.getByTestId('workout-session')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('redirects unknown paths to /routines', () => {
    renderWithRouter(['/unknown']);
    expect(screen.getByTestId('routines')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('wraps logout-required routes with RequiresLogout', () => {
    renderWithRouter(['/users/register']);
    expect(screen.getByTestId('requires-logout')).toBeInTheDocument();
    expect(screen.getByTestId('register')).toBeInTheDocument();
  });

  test('wraps login-required routes with RequiresLogin', () => {
    renderWithRouter(['/routines']);
    expect(screen.getByTestId('requires-login')).toBeInTheDocument();
    expect(screen.getByTestId('routines')).toBeInTheDocument();
  });
});