import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Header from '../../modules/app/components/Header';
import Layout from '../../modules/app/components/Layout';
import NotificationIcon from '../../modules/app/components/common/notifications/NotificationIcon';
import NotificationPopup from '../../modules/app/components/common/notifications/NotificationPopup';
import ConfirmationPopup from '../../modules/app/components/common/popup/ConfirmationPopup';
import Popup from '../../modules/app/components/common/popup/Popup';
import CropModal from '../../modules/app/components/common/CropModal';
import FileUploadButton from '../../modules/app/components/common/FileUploadButton';
import ProfilePhoto from '../../modules/app/components/common/profilePhoto';
import RequiresLogout from '../../modules/app/components/common/RequiresLogout';
import Slogan from '../../modules/app/components/common/Slogan';
import FollowersPage from '../../modules/app/components/users/FollowersPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/routines' }),
}));

jest.mock('../../backend/userService', () => ({
  tryLoginFromServiceToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../backend/workoutService', () => ({
  getWorkouts: jest.fn(),
}));

jest.mock('../../backend/notificationService', () => ({
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

jest.mock('../../backend/userFollowService', () => ({
  getFollowers: jest.fn(),
}));

jest.mock('../../backend/appFetch', () => ({
  getServiceToken: jest.fn(),
}));

jest.mock('react-easy-crop', () => ({
  __esModule: true,
  default: ({ onCropComplete, onZoomChange, ...props }) => (
    <div data-testid="cropper-mock" {...props}>
      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        defaultValue="1"
        onChange={(e) => onZoomChange && onZoomChange(Number(e.target.value))}
      />
      <button onClick={() => onCropComplete && onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 })}>
        Complete Crop
      </button>
    </div>
  ),
}));

import { tryLoginFromServiceToken, logout } from '../../backend/userService';
import { getWorkouts } from '../../backend/workoutService';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '../../backend/notificationService';
import { getFollowers } from '../../backend/userFollowService';
import { getServiceToken } from '../../backend/appFetch';

describe('Common Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout Component', () => {
    test('renders children within layout', () => {
      act(() => {
        render(
          <MemoryRouter>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </MemoryRouter>
        );
      });

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Slogan Component', () => {
    test('renders slogan text correctly', () => {
      render(<Slogan />);

      expect(screen.getByText('Entrenemos tus sueños, no tus excusas.')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<Slogan className="custom-class" />);

      const slogan = screen.getByText('Entrenemos tus sueños, no tus excusas.');
      expect(slogan).toHaveClass('custom-class');
    });
  });

  describe('ProfilePhoto Component', () => {
    test('renders default profile image when no profilePicture provided', () => {
      render(<ProfilePhoto />);

      const img = screen.getByAltText('Foto de perfil');
      expect(img).toHaveAttribute('src', expect.stringContaining('default-profile.jpg'));
    });

    test('renders profile picture when provided', () => {
      const base64Image = 'base64encodedimage';
      render(<ProfilePhoto profilePicture={base64Image} />);

      const img = screen.getByAltText('Foto de perfil');
      expect(img).toHaveAttribute('src', `data:image/jpeg;base64,${base64Image}`);
    });

    test('renders small size correctly', () => {
      render(<ProfilePhoto size="small" />);

      const container = screen.getByAltText('Foto de perfil').parentElement;
      expect(container).toHaveClass('profile-photo-small');
    });

    test('renders large size by default', () => {
      render(<ProfilePhoto />);

      const container = screen.getByAltText('Foto de perfil').parentElement;
      expect(container).toHaveClass('profile-photo');
    });

    test('uses custom alt text', () => {
      render(<ProfilePhoto alt="Custom Alt" />);

      expect(screen.getByAltText('Custom Alt')).toBeInTheDocument();
    });
  });

  describe('Popup Component', () => {
    test('does not render when show is false', () => {
      render(<Popup show={false} text="Test message" onOk={() => {}} />);

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    test('renders popup when show is true', () => {
      render(<Popup show={true} text="Test message" onOk={() => {}} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    test('calls onOk when OK button is clicked', () => {
      const mockOnOk = jest.fn();
      render(<Popup show={true} text="Test message" onOk={mockOnOk} />);

      fireEvent.click(screen.getByText('OK'));
      expect(mockOnOk).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmationPopup Component', () => {
    test('does not render when show is false', () => {
      render(<ConfirmationPopup show={false} text="Test message" onOk={() => {}} onCancel={() => {}} />);

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    test('renders popup when show is true', () => {
      render(<ConfirmationPopup show={true} text="Test message" onOk={() => {}} onCancel={() => {}} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getAllByText('OK')).toHaveLength(1);
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    test('calls onOk when OK button is clicked', () => {
      const mockOnOk = jest.fn();
      const mockOnCancel = jest.fn();
      render(<ConfirmationPopup show={true} text="Test message" onOk={mockOnOk} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('OK'));
      expect(mockOnOk).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    test('calls onCancel when Cancel button is clicked', () => {
      const mockOnOk = jest.fn();
      const mockOnCancel = jest.fn();
      render(<ConfirmationPopup show={true} text="Test message" onOk={mockOnOk} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnOk).not.toBeCalled();
    });
  });

  describe('FileUploadButton Component', () => {
    test('renders upload button', () => {
      render(<FileUploadButton onFileSelect={() => {}} />);

      expect(screen.getByText('Subir foto')).toBeInTheDocument();
    });

    test('triggers file input on button click', () => {
      const { container } = render(<FileUploadButton onFileSelect={() => {}} />);

      const button = screen.getByText('Subir foto');
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, 'click');
      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    test('calls onFileSelect when file is selected', () => {
      const mockOnFileSelect = jest.fn();
      const { container } = render(<FileUploadButton onFileSelect={mockOnFileSelect} />);

      const input = container.querySelector('input[type="file"]');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    test('does not call onFileSelect when no file selected', () => {
      const mockOnFileSelect = jest.fn();
      const { container } = render(<FileUploadButton onFileSelect={mockOnFileSelect} />);

      const input = container.querySelector('input[type="file"]');

      fireEvent.change(input, { target: { files: [] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('RequiresLogout Component', () => {
    test('renders Outlet when no service token exists', () => {
      getServiceToken.mockReturnValue(null);

      render(
        <MemoryRouter>
          <RequiresLogout />
        </MemoryRouter>
      );

    });

    test('redirects to /routines when service token exists', () => {
      getServiceToken.mockReturnValue('mock-token');

      render(
        <MemoryRouter initialEntries={['/users/login']}>
          <Routes>
            <Route path="/users/login" element={<RequiresLogout />}>
              <Route index element={<div>Login Content</div>} />
            </Route>
            <Route path="/routines" element={<div>Routines Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Routines Page')).toBeInTheDocument();
    });
  });

  describe('NotificationIcon Component', () => {
    test('renders notification icon', () => {
      getUserNotifications.mockImplementation((success) => success([]));

      render(<NotificationIcon onClick={() => {}} />);

      const img = screen.getByAltText('Notificaciones');
      expect(img).toHaveAttribute('src', expect.stringContaining('notification-icon.svg'));
    });

    test('displays notification badge when there are unread notifications', async () => {
      getUserNotifications.mockImplementation((success) => success([
        { id: 1, isRead: false },
        { id: 2, isRead: true },
        { id: 3, isRead: false }
      ]));

      render(<NotificationIcon onClick={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    test('does not display badge when no unread notifications', async () => {
      getUserNotifications.mockImplementation((success) => success([
        { id: 1, isRead: true },
        { id: 2, isRead: true }
      ]));

      render(<NotificationIcon onClick={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText('0')).not.toBeInTheDocument();
      });
    });

    test('calls onClick when icon is clicked', () => {
      const mockOnClick = jest.fn();
      getUserNotifications.mockImplementation((success) => success([]));

      render(<NotificationIcon onClick={mockOnClick} />);

      const button = screen.getByAltText('Notificaciones').closest('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('updates count when refreshTrigger changes', async () => {
      getUserNotifications.mockImplementation((success) => success([{ id: 1, isRead: false }]));

      const { rerender } = render(<NotificationIcon onClick={() => {}} refreshTrigger={[]} />);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      getUserNotifications.mockImplementation((success) => success([
        { id: 1, isRead: false },
        { id: 2, isRead: false }
      ]));

      rerender(<NotificationIcon onClick={() => {}} refreshTrigger={[{ id: 2 }]} />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('NotificationPopup Component', () => {
    test('renders popup with notifications', () => {
      const notifications = [
        { id: 1, message: 'Test notification', date: '2023-01-01T00:00:00', isRead: false, routineId: 1 }
      ];

      render(<NotificationPopup notifications={notifications} onClose={() => {}} />);

      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    test('renders empty state when no notifications', () => {
      render(<NotificationPopup notifications={[]} onClose={() => {}} />);

      expect(screen.getByText('Sin notificaciones')).toBeInTheDocument();
    });

    test('calls onClose when clicking outside', () => {
      const mockOnClose = jest.fn();

      render(<NotificationPopup notifications={[]} onClose={mockOnClose} />);

      const popup = screen.getByText('Notificaciones').closest('.popup');
      fireEvent.mouseDown(document.body);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('marks notification as read and navigates on click', () => {
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        { id: 1, message: 'Test notification', date: '2023-01-01T00:00:00', isRead: false, routineId: 1 }
      ];

      markNotificationAsRead.mockImplementation((id, success) => success());

      render(
        <MemoryRouter>
          <NotificationPopup
            notifications={notifications}
            onClose={() => {}}
            onNotificationRead={mockOnNotificationRead}
          />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText('Test notification'));

      expect(markNotificationAsRead).toHaveBeenCalledWith(1, expect.any(Function), expect.any(Function));
      expect(mockNavigate).toHaveBeenCalledWith('/routines/1');
      expect(mockOnNotificationRead).toHaveBeenCalledWith(1, 'read');
    });

    test('deletes notification on delete button click', () => {
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        { id: 1, message: 'Test notification', date: '2023-01-01T00:00:00', isRead: false, routineId: 1 }
      ];

      deleteNotification.mockImplementation((id, success) => success());

      render(
        <NotificationPopup
          notifications={notifications}
          onClose={() => {}}
          onNotificationRead={mockOnNotificationRead}
        />
      );

      const deleteButton = screen.getByText('✕');
      fireEvent.click(deleteButton);

      expect(deleteNotification).toHaveBeenCalledWith(1, expect.any(Function), expect.any(Function));
      expect(mockOnNotificationRead).toHaveBeenCalledWith(1, 'delete');
    });

    test('formats date correctly', () => {
      const notifications = [
        { id: 1, message: 'Test', date: '2023-10-20T15:30:00', isRead: false, routineId: 1 }
      ];

      render(<NotificationPopup notifications={notifications} onClose={() => {}} />);

      expect(screen.getByText((content) => content.includes('20 oct 2023, 15:30'))).toBeInTheDocument();
    });
  });

  describe('CropModal Component', () => {
    const mockImageSrc = 'data:image/jpeg;base64,testimage';

    test('renders crop modal with controls', () => {
      render(<CropModal imageSrc={mockImageSrc} onCancel={() => {}} onSave={() => {}} />);

      expect(screen.getByText('Zoom')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    test('calls onCancel when cancel button is clicked', () => {
      const mockOnCancel = jest.fn();

      render(<CropModal imageSrc={mockImageSrc} onCancel={mockOnCancel} onSave={() => {}} />);

      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('FollowersPage Component', () => {
    test('shows loading state initially', () => {
      tryLoginFromServiceToken.mockImplementation(() => {});

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Cargando seguidores...')).toBeInTheDocument();
    });

    test('redirects to login on authentication failure', async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => error());

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/users/login');
        expect(screen.getByText('Sesión expirada. Inicia sesión de nuevo.')).toBeInTheDocument();
      });
    });

    test('shows error for non-trainer users', async () => {
      tryLoginFromServiceToken.mockImplementation((success) => success({ user: { role: 'CLIENT' } }));

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Solo los entrenadores pueden ver sus seguidores.')).toBeInTheDocument();
      });
    });

    test('displays followers for trainer', async () => {
      const mockUser = { id: 1, role: 'TRAINER' };
      const mockFollowers = [
        { id: 1, userName: 'John', userSurname: 'Doe', userEmail: 'john@example.com' },
        { id: 2, userName: 'Jane', userSurname: 'Smith', userEmail: 'jane@example.com' }
      ];

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getFollowers.mockImplementation((userId, success) => success(mockFollowers));

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Tus Seguidores')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });

    test('shows no followers message when empty', async () => {
      const mockUser = { id: 1, role: 'TRAINER' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Aún no tienes seguidores.')).toBeInTheDocument();
      });
    });

    test('shows error on followers fetch failure', async () => {
      const mockUser = { id: 1, role: 'TRAINER' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getFollowers.mockImplementation((userId, success, error) => error());

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No se pudieron cargar los seguidores.')).toBeInTheDocument();
      });
    });
  });

  describe('Header Component', () => {
    beforeEach(() => {
      jest.spyOn(window, 'addEventListener').mockImplementation(() => {});
      jest.spyOn(window, 'removeEventListener').mockImplementation(() => {});
    });

    afterEach(() => {
      window.addEventListener.mockRestore();
      window.removeEventListener.mockRestore();
    });

    test('renders header with logo and navigation', () => {
      tryLoginFromServiceToken.mockImplementation((success) => success({ user: { id: 1, role: 'CLIENT' } }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByAltText('Logo medgym')).toBeInTheDocument();
      expect(screen.getByText('Entrenamientos')).toBeInTheDocument();
      expect(screen.getByText('Ejercicios')).toBeInTheDocument();
      expect(screen.getByText('Historial')).toBeInTheDocument();
    });

    test('displays active workout badge when workout is active', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };
      const mockWorkouts = [{ id: 1, routineName: 'Test Routine', endTime: null }];

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success(mockWorkouts));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('🏋️ Entrenamiento Activo')).toBeInTheDocument();
      });
    });

    test('navigates to workout on active workout click', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };
      const mockWorkouts = [{ id: 123, routineName: 'Test Routine', endTime: null }];

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success(mockWorkouts));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const activeWorkoutButton = screen.getByText('🏋️ Entrenamiento Activo');
        fireEvent.click(activeWorkoutButton);
        expect(mockNavigate).toHaveBeenCalledWith('/workouts/session/123');
      });
    });

    test('shows followers link for trainers', async () => {
      const mockUser = { id: 1, role: 'TRAINER' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Seguidores (0)')).toBeInTheDocument();
      });
    });

    test('shows moderation link for admins', async () => {
      const mockUser = { id: 1, role: 'ADMIN' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Moderación')).toBeInTheDocument();
      });
    });

    test('toggles profile dropdown on profile button click', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const profileButton = screen.getByAltText('Foto de perfil').closest('button');
        fireEvent.click(profileButton);
        expect(screen.getByText('Ver Perfil')).toBeInTheDocument();
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
      });
    });

    test('navigates to profile on view profile click', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const profileButton = screen.getByAltText('Foto de perfil').closest('button');
        fireEvent.click(profileButton);
        fireEvent.click(screen.getByText('Ver Perfil'));
        expect(mockNavigate).toHaveBeenCalledWith('/users/profile');
      });
    });

    test('logs out and navigates to login on logout click', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const profileButton = screen.getByAltText('Foto de perfil').closest('button');
        fireEvent.click(profileButton);
        fireEvent.click(screen.getByText('Cerrar Sesión'));
        expect(logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/users/login');
      });
    });

    test('closes dropdown when clicking outside', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const profileButton = screen.getByAltText('Foto de perfil').closest('button');
        fireEvent.click(profileButton);
        expect(screen.getByText('Ver Perfil')).toBeInTheDocument();

        fireEvent.mouseDown(document.body);
        expect(screen.queryByText('Ver Perfil')).not.toBeInTheDocument();
      });
    });

    test('toggles notifications popup', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const notificationButton = screen.getByAltText('Notificaciones').closest('button');
        fireEvent.click(notificationButton);
        expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      });
    });

    test('closes notifications when opening profile dropdown', async () => {
      const mockUser = { id: 1, role: 'CLIENT' };

      tryLoginFromServiceToken.mockImplementation((success) => success({ user: mockUser }));
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      await waitFor(() => {
        const notificationButton = screen.getByAltText('Notificaciones').closest('button');
        fireEvent.click(notificationButton);
        expect(screen.getByText('Notificaciones')).toBeInTheDocument();

        const profileButton = screen.getByAltText('Foto de perfil').closest('button');
        fireEvent.click(profileButton);

        expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
        expect(screen.getByText('Ver Perfil')).toBeInTheDocument();
      });
    });
  });
});