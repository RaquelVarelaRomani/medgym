import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import WorkoutHistory from '../../modules/app/components/workouts/WorkoutHistory';
import WorkoutDetails from '../../modules/app/components/workouts/WorkoutDetails';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

jest.mock('../../backend/userService', () => ({
  tryLoginFromServiceToken: jest.fn(),
}));

jest.mock('../../backend/workoutService', () => ({
  getWorkouts: jest.fn(),
  getWorkout: jest.fn(),
}));

jest.mock('../../backend/workoutExerciseService', () => ({
  getWorkoutExercisesByWorkoutId: jest.fn(),
}));

jest.mock('../../backend/routineExerciseService', () => ({
  getRoutineExercises: jest.fn(),
}));

import { tryLoginFromServiceToken } from '../../backend/userService';
import { getWorkouts, getWorkout } from '../../backend/workoutService';
import { getWorkoutExercisesByWorkoutId } from '../../backend/workoutExerciseService';
import { getRoutineExercises } from '../../backend/routineExerciseService';

describe('Workout Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WorkoutHistory Component', () => {
    test('renders loading state initially', () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      expect(screen.getByText('Cargando historial...')).toBeInTheDocument();
    });

    test('redirects to login on authentication failure', () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/users/login');
    });

    test('renders error state when loading workouts fails', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkouts.mockImplementation((success, error) => {
        error({ globalError: 'Error al cargar el historial' });
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar el historial')).toBeInTheDocument();
        expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
      });
    });

    test('renders empty state when no workouts exist', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkouts.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No has realizado ningún entrenamiento todavía.')).toBeInTheDocument();
        expect(screen.getByText('Ver entrenamientos disponibles')).toBeInTheDocument();
      });
    });

    test('renders workout list correctly', async () => {
      const mockWorkouts = [
        {
          id: 1,
          routineName: 'Rutina 1',
          startTime: '2023-10-01T10:00:00Z',
          endTime: '2023-10-01T11:00:00Z',
        },
        {
          id: 2,
          routineName: 'Rutina 2',
          startTime: '2023-10-02T10:00:00Z',
          endTime: null,
        },
      ];

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkouts.mockImplementation((success) => {
        success(mockWorkouts);
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Historial de entrenamientos')).toBeInTheDocument();
        expect(screen.getByText('Rutina 2')).toBeInTheDocument();
        expect(screen.getByText('Rutina 1')).toBeInTheDocument();
        expect(screen.getByText('En progreso')).toBeInTheDocument();
        expect(screen.getByText('1h 0min')).toBeInTheDocument();
      });
    });

    test('handles retry button click', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkouts.mockImplementationOnce((success, error) => {
        error({ globalError: 'Error' });
      }).mockImplementationOnce((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Intentar de nuevo'));

      await waitFor(() => {
        expect(getWorkouts).toHaveBeenCalledTimes(2);
      });
    });

    test('navigates to routines on empty state button click', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkouts.mockImplementation((success) => {
        success([]);
      });

      render(
        <MemoryRouter>
          <WorkoutHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Ver entrenamientos disponibles')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ver entrenamientos disponibles'));

      expect(mockNavigate).toHaveBeenCalledWith('/routines');
    });
  });

  describe('WorkoutDetails Component', () => {
    test('renders loading state initially', () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Cargando detalles del entrenamiento...')).toBeInTheDocument();
    });

    test('redirects to login on authentication failure', () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => {
        error();
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/users/login');
    });

    test('renders error state when loading workout fails', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success, error) => {
        error('Error al cargar el entrenamiento');
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar el entrenamiento')).toBeInTheDocument();
        expect(screen.getByText('Volver al historial')).toBeInTheDocument();
      });
    });

    test('renders workout details correctly', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      const mockRoutineExercises = {
        content: [
          { id: 1, exerciseName: 'Press de banca', position: 1 },
          { id: 2, exerciseName: 'Sentadillas', position: 2 },
        ],
      };

      const mockWorkoutExercises = [
        { id: 1, routineExerciseId: 1, reps: 10, weight: 80 },
        { id: 2, routineExerciseId: 1, reps: 8, weight: 85 },
        { id: 3, routineExerciseId: 2, reps: 12, weight: 100 },
      ];

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success(mockRoutineExercises);
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success(mockWorkoutExercises);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        expect(screen.getByText('Fecha:')).toBeInTheDocument();
        expect(screen.getByText('Duración:')).toBeInTheDocument();
        expect(screen.getByText('1h 30min')).toBeInTheDocument();
        expect(screen.getByText('1. Press de banca')).toBeInTheDocument();
        expect(screen.getByText('2. Sentadillas')).toBeInTheDocument();
      });
    });

    test('displays logged sets when exercise is expanded', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      const mockRoutineExercises = {
        content: [
          { id: 1, exerciseName: 'Press de banca', position: 1 },
        ],
      };

      const mockWorkoutExercises = [
        { id: 1, routineExerciseId: 1, reps: 10, weight: 80 },
        { id: 2, routineExerciseId: 1, reps: 8, weight: 85 },
      ];

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success(mockRoutineExercises);
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success(mockWorkoutExercises);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('1. Press de banca')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1. Press de banca'));

      await waitFor(() => {
        expect(screen.getByText('Series realizadas:')).toBeInTheDocument();
        expect(screen.getByText('Serie 1')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('80')).toBeInTheDocument();
        expect(screen.getByText('Serie 2')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
      });
    });

    test('displays no data message when no logged sets exist', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      const mockRoutineExercises = {
        content: [
          { id: 1, exerciseName: 'Press de banca', position: 1 },
        ],
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success(mockRoutineExercises);
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success([]);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('1. Press de banca')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1. Press de banca'));

      await waitFor(() => {
        expect(screen.getByText('No se registraron datos para este ejercicio')).toBeInTheDocument();
      });
    });

    test('displays no exercises message when routine has no exercises', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina Vacía',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success({ content: [] });
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success([]);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No hay ejercicios registrados')).toBeInTheDocument();
      });
    });

    test('handles back button click', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success({ content: [] });
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success([]);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('←')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('←'));

      expect(mockNavigate).toHaveBeenCalledWith('/workouts/history');
    });

    test('displays in progress for workouts without end time', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina en Progreso',
        startTime: '2023-10-01T10:00:00Z',
        endTime: null,
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success({ content: [] });
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success) => {
        success([]);
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('En progreso')).toBeInTheDocument();
      });
    });

    test('handles error loading routine exercises', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success, error) => {
        error('Error al cargar los ejercicios');
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error al cargar los ejercicios')).toBeInTheDocument();
      });
    });

    test('handles error loading workout exercises gracefully', async () => {
      const mockWorkout = {
        id: 1,
        routineId: 1,
        routineName: 'Rutina de Fuerza',
        startTime: '2023-10-01T10:00:00Z',
        endTime: '2023-10-01T11:30:00Z',
      };

      const mockRoutineExercises = {
        content: [
          { id: 1, exerciseName: 'Press de banca', position: 1 },
        ],
      };

      tryLoginFromServiceToken.mockImplementation((success) => {
        success({ user: { id: 1 } });
      });

      getWorkout.mockImplementation((id, success) => {
        success(mockWorkout);
      });

      getRoutineExercises.mockImplementation((routineId, success) => {
        success(mockRoutineExercises);
      });

      getWorkoutExercisesByWorkoutId.mockImplementation((workoutId, success, error) => {
        error('No workout exercises found');
      });

      render(
        <MemoryRouter initialEntries={['/workouts/1']}>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Rutina de Fuerza')).toBeInTheDocument();
        expect(screen.getByText('1. Press de banca')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1. Press de banca'));

      await waitFor(() => {
        expect(screen.getByText('No se registraron datos para este ejercicio')).toBeInTheDocument();
      });
    });
  });
});