import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Header from "../../modules/app/components/Header";
import Layout from "../../modules/app/components/Layout";
import NotificationIcon from "../../modules/app/components/common/notifications/NotificationIcon";
import NotificationPopup from "../../modules/app/components/common/notifications/NotificationPopup";
import ConfirmationPopup from "../../modules/app/components/common/popup/ConfirmationPopup";
import Popup from "../../modules/app/components/common/popup/Popup";
import CropModal from "../../modules/app/components/common/CropModal";
import FileUploadButton from "../../modules/app/components/common/FileUploadButton";
import ProfilePhoto from "../../modules/app/components/common/profilePhoto";
import RequiresLogout from "../../modules/app/components/common/RequiresLogout";
import Slogan from "../../modules/app/components/common/Slogan";
import HeartLike from "../../modules/app/components/common/HeartLike";
import LoadingMessage from "../../modules/app/components/common/LoadingMessage";
import FollowersPage from "../../modules/app/components/users/FollowersPage";

import { tryLoginFromServiceToken, logout } from "../../backend/userService";
import { getWorkouts } from "../../backend/workoutService";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../backend/notificationService";
import { getFollowers } from "../../backend/userFollowService";
import { getServiceToken } from "../../backend/appFetch";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../../backend/workoutService", () => ({
  getWorkouts: jest.fn(),
}));

jest.mock("../../backend/notificationService", () => ({
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

jest.mock("../../backend/userFollowService", () => ({
  getFollowers: jest.fn(),
}));

jest.mock("../../backend/appFetch", () => ({
  getServiceToken: jest.fn(),
}));

jest.mock("react-easy-crop", () => ({
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
      <button
        onClick={() =>
          onCropComplete &&
          onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 })
        }
      >
        Complete Crop
      </button>
    </div>
  ),
}));

describe("Common Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Slogan Component", () => {
    test("renders slogan text correctly", () => {
      render(<Slogan />);

      expect(
        screen.getByText("Entrenemos tus sueños, no tus excusas."),
      ).toBeInTheDocument();
    });

    test("applies custom className", () => {
      render(<Slogan className="custom-class" />);

      const slogan = screen.getByText("Entrenemos tus sueños, no tus excusas.");
      expect(slogan).toHaveClass("custom-class");
    });
  });

  describe("ProfilePhoto Component", () => {
    test("renders default profile image when no profilePicture provided", () => {
      render(<ProfilePhoto />);

      const img = screen.getByAltText("Foto de perfil");
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("default-profile.jpg"),
      );
    });

    test("renders profile picture when provided", () => {
      const base64Image = "base64encodedimage";
      render(<ProfilePhoto profilePicture={base64Image} />);

      const img = screen.getByAltText("Foto de perfil");
      expect(img).toHaveAttribute(
        "src",
        `data:image/jpeg;base64,${base64Image}`,
      );
    });

    test("renders small size correctly", () => {
      render(<ProfilePhoto size="small" />);

      const container = screen.getByAltText("Foto de perfil").parentElement;
      expect(container).toHaveClass("profile-photo-small");
    });

    test("renders large size by default", () => {
      render(<ProfilePhoto />);

      const container = screen.getByAltText("Foto de perfil").parentElement;
      expect(container).toHaveClass("profile-photo");
    });

    test("uses custom alt text", () => {
      render(<ProfilePhoto alt="Custom Alt" />);

      expect(screen.getByAltText("Custom Alt")).toBeInTheDocument();
    });
  });

  describe("Popup Component", () => {
    test("does not render when show is false", () => {
      render(<Popup show={false} text="Test message" onOk={() => {}} />);

      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    test("renders popup when show is true", () => {
      render(<Popup show={true} text="Test message" onOk={() => {}} />);

      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    test("calls onOk when OK button is clicked", () => {
      const mockOnOk = jest.fn();
      render(<Popup show={true} text="Test message" onOk={mockOnOk} />);

      fireEvent.click(screen.getByText("OK"));
      expect(mockOnOk).toHaveBeenCalledTimes(1);
    });
  });

  describe("ConfirmationPopup Component", () => {
    test("does not render when show is false", () => {
      render(
        <ConfirmationPopup
          show={false}
          text="Test message"
          onOk={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    test("renders popup when show is true", () => {
      render(
        <ConfirmationPopup
          show={true}
          text="Test message"
          onOk={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getAllByText("OK")).toHaveLength(1);
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    test("calls onOk when OK button is clicked", () => {
      const mockOnOk = jest.fn();
      const mockOnCancel = jest.fn();
      render(
        <ConfirmationPopup
          show={true}
          text="Test message"
          onOk={mockOnOk}
          onCancel={mockOnCancel}
        />,
      );

      fireEvent.click(screen.getByText("OK"));
      expect(mockOnOk).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    test("calls onCancel when Cancel button is clicked", () => {
      const mockOnOk = jest.fn();
      const mockOnCancel = jest.fn();
      render(
        <ConfirmationPopup
          show={true}
          text="Test message"
          onOk={mockOnOk}
          onCancel={mockOnCancel}
        />,
      );

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnOk).not.toBeCalled();
    });
  });

  describe("FileUploadButton Component", () => {
    test("renders upload button", () => {
      render(<FileUploadButton onFileSelect={() => {}} />);

      expect(screen.getByText("Subir foto")).toBeInTheDocument();
    });

    test("triggers file input on button click", () => {
      const { container } = render(
        <FileUploadButton onFileSelect={() => {}} />,
      );

      const button = screen.getByText("Subir foto");
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, "click");
      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    test("calls onFileSelect when file is selected", () => {
      const mockOnFileSelect = jest.fn();
      const { container } = render(
        <FileUploadButton onFileSelect={mockOnFileSelect} />,
      );

      const input = container.querySelector('input[type="file"]');
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    test("does not call onFileSelect when no file selected", () => {
      const mockOnFileSelect = jest.fn();
      const { container } = render(
        <FileUploadButton onFileSelect={mockOnFileSelect} />,
      );

      const input = container.querySelector('input[type="file"]');

      fireEvent.change(input, { target: { files: [] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("RequiresLogout Component", () => {
    test("renders Outlet when no service token exists", () => {
      getServiceToken.mockReturnValue(null);

      render(
        <MemoryRouter>
          <RequiresLogout />
        </MemoryRouter>,
      );
    });

    test("redirects to /routines when service token exists", () => {
      getServiceToken.mockReturnValue("mock-token");

      render(
        <MemoryRouter initialEntries={["/users/login"]}>
          <Routes>
            <Route path="/users/login" element={<RequiresLogout />}>
              <Route index element={<div>Login Content</div>} />
            </Route>
            <Route path="/routines" element={<div>Routines Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Routines Page")).toBeInTheDocument();
    });
  });

  describe("NotificationIcon Component", () => {
    test("renders notification icon", () => {
      getUserNotifications.mockImplementation((success) => success([]));

      render(<NotificationIcon onClick={() => {}} />);

      const img = screen.getByAltText("Notificaciones");
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("notification-icon.svg"),
      );
    });

    test("displays notification badge when there are unread notifications", async () => {
      getUserNotifications.mockImplementation((success) =>
        success([
          { id: 1, isRead: false },
          { id: 2, isRead: true },
          { id: 3, isRead: false },
        ]),
      );

      render(<NotificationIcon onClick={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    test("does not display badge when no unread notifications", async () => {
      getUserNotifications.mockImplementation((success) =>
        success([
          { id: 1, isRead: true },
          { id: 2, isRead: true },
        ]),
      );

      render(<NotificationIcon onClick={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText("0")).not.toBeInTheDocument();
      });
    });

    test("calls onClick when icon is clicked", () => {
      const mockOnClick = jest.fn();
      getUserNotifications.mockImplementation((success) => success([]));

      render(<NotificationIcon onClick={mockOnClick} />);

      const button = screen.getByAltText("Notificaciones").closest("button");
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("updates count when refreshTrigger changes", async () => {
      getUserNotifications.mockImplementation((success) =>
        success([{ id: 1, isRead: false }]),
      );

      const { rerender } = render(
        <NotificationIcon onClick={() => {}} refreshTrigger={[]} />,
      );

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });

      getUserNotifications.mockImplementation((success) =>
        success([
          { id: 1, isRead: false },
          { id: 2, isRead: false },
        ]),
      );

      rerender(
        <NotificationIcon onClick={() => {}} refreshTrigger={[{ id: 2 }]} />,
      );

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });
  });

  describe("NotificationPopup Component", () => {
    test("renders popup with notifications", () => {
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          isRead: false,
          routineId: 1,
        },
      ];

      render(
        <NotificationPopup notifications={notifications} onClose={() => {}} />,
      );

      expect(screen.getByText("Notificaciones")).toBeInTheDocument();
      expect(screen.getByText("Test notification")).toBeInTheDocument();
    });

    test("renders empty state when no notifications", () => {
      render(<NotificationPopup notifications={[]} onClose={() => {}} />);

      expect(screen.getByText("Sin notificaciones")).toBeInTheDocument();
    });

    test("calls onClose when clicking outside", () => {
      const mockOnClose = jest.fn();

      render(<NotificationPopup notifications={[]} onClose={mockOnClose} />);

      const popup = screen.getByText("Notificaciones").closest(".popup");
      fireEvent.mouseDown(document.body);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("marks notification as read and navigates on click", () => {
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          isRead: false,
          type: "NEW_ROUTINE",
          idToRedirect: 1,
        },
      ];

      markNotificationAsRead.mockImplementation((id, success) => success());

      render(
        <MemoryRouter>
          <NotificationPopup
            notifications={notifications}
            onClose={() => {}}
            onNotificationRead={mockOnNotificationRead}
          />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Test notification"));

      expect(markNotificationAsRead).toHaveBeenCalledWith(
        1,
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/routines/1");
      expect(mockOnNotificationRead).toHaveBeenCalledWith(1, "read");
    });

    test("deletes notification on delete button click", () => {
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          isRead: false,
          routineId: 1,
        },
      ];

      deleteNotification.mockImplementation((id, success) => success());

      render(
        <NotificationPopup
          notifications={notifications}
          onClose={() => {}}
          onNotificationRead={mockOnNotificationRead}
        />,
      );

      const deleteButton = screen.getByText("✕");
      fireEvent.click(deleteButton);

      expect(deleteNotification).toHaveBeenCalledWith(
        1,
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockOnNotificationRead).toHaveBeenCalledWith(1, "delete");
    });

    test("formats date correctly", () => {
      const notifications = [
        {
          id: 1,
          message: "Test",
          date: "2023-10-20T15:30:00",
          isRead: false,
          routineId: 1,
        },
      ];

      render(
        <NotificationPopup notifications={notifications} onClose={() => {}} />,
      );

      expect(
        screen.getByText((content) => content.includes("20 oct 2023, 15:30")),
      ).toBeInTheDocument();
    });

    test("handles error in markNotificationAsRead", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          isRead: false,
          routineId: 1,
        },
      ];

      markNotificationAsRead.mockImplementation((id, success, error) =>
        error(new Error("Mark read failed")),
      );

      render(
        <MemoryRouter>
          <NotificationPopup
            notifications={notifications}
            onClose={() => {}}
            onNotificationRead={mockOnNotificationRead}
          />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Test notification"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error marking notification as read:",
        expect.any(Error),
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("handles error in deleteNotification", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          isRead: false,
          routineId: 1,
        },
      ];

      deleteNotification.mockImplementation((id, success, error) =>
        error(new Error("Delete failed")),
      );

      render(
        <NotificationPopup
          notifications={notifications}
          onClose={() => {}}
          onNotificationRead={mockOnNotificationRead}
        />,
      );

      const deleteButton = screen.getByText("✕");
      fireEvent.click(deleteButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting notification:",
        expect.any(Error),
      );
      expect(mockOnNotificationRead).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("handles notification without routineId", () => {
      const mockOnNotificationRead = jest.fn();
      const notifications = [
        {
          id: 1,
          message: "Test notification",
          date: "2023-01-01T00:00:00",
          type: "FOLLOW",
          isRead: false,
          idToRedirect: 1,
        },
      ];

      markNotificationAsRead.mockImplementation((id, success) => success());

      render(
        <MemoryRouter>
          <NotificationPopup
            notifications={notifications}
            onClose={() => {}}
            onNotificationRead={mockOnNotificationRead}
          />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText("Test notification"));

      expect(markNotificationAsRead).toHaveBeenCalledWith(
        1,
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
    });

    test("handles invalid date", () => {
      const notifications = [
        {
          id: 1,
          message: "Test",
          date: "invalid-date",
          isRead: false,
          routineId: 1,
        },
      ];

      render(
        <NotificationPopup notifications={notifications} onClose={() => {}} />,
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("CropModal Component", () => {
    const mockImageSrc = "data:image/jpeg;base64,testimage";

    test("renders crop modal with controls", () => {
      render(
        <CropModal
          imageSrc={mockImageSrc}
          onCancel={() => {}}
          onSave={() => {}}
        />,
      );

      expect(screen.getByText("Zoom")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    test("calls onCancel when cancel button is clicked", () => {
      const mockOnCancel = jest.fn();

      render(
        <CropModal
          imageSrc={mockImageSrc}
          onCancel={mockOnCancel}
          onSave={() => {}}
        />,
      );

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test("handles error in crop save", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      global.Image = class {
        constructor() {
          setTimeout(() => this.onerror(new Error("Image load error")), 0);
        }
      };

      const mockOnSave = jest.fn();

      render(
        <CropModal
          imageSrc={mockImageSrc}
          onCancel={() => {}}
          onSave={mockOnSave}
        />,
      );

      const completeCropButton = screen.getByText("Complete Crop");
      fireEvent.click(completeCropButton);

      fireEvent.click(screen.getByText("Guardar"));

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error al recortar:",
          expect.any(Error),
        );
        expect(mockOnSave).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      }, 0);
    });
  });

  describe("FollowersPage Component", () => {
    test("shows loading state initially", () => {
      tryLoginFromServiceToken.mockImplementation(() => {});

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>,
      );

      expect(screen.getByText("Cargando seguidores...")).toBeInTheDocument();
    });

    test("redirects to login on authentication failure", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) => error());

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
        expect(
          screen.getByText("Sesión expirada. Inicia sesión de nuevo."),
        ).toBeInTheDocument();
      });
    });


    test("displays followers for trainer", async () => {
      const mockUser = { id: 1, role: "TRAINER" };
      const mockFollowers = [
        {
          id: 1,
          userName: "John",
          userSurname: "Doe",
          userEmail: "john@example.com",
        },
        {
          id: 2,
          userName: "Jane",
          userSurname: "Smith",
          userEmail: "jane@example.com",
        },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getFollowers.mockImplementation((userId, success) =>
        success(mockFollowers),
      );

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Tus Seguidores")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      });
    });

    test("shows no followers message when empty", async () => {
      const mockUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Aún no tienes seguidores."),
        ).toBeInTheDocument();
      });
    });

    test("shows error on followers fetch failure", async () => {
      const mockUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getFollowers.mockImplementation((userId, success, error) => error());

      render(
        <MemoryRouter>
          <FollowersPage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("No se pudieron cargar los seguidores."),
        ).toBeInTheDocument();
      });
    });

    describe("HeartLike Component", () => {
      test("renders heart icon correctly", () => {
        const mockOnChange = jest.fn();
        render(<HeartLike liked={false} onChange={mockOnChange} />);

        const button = screen.getByRole("button", { name: /dar me gusta/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("aria-pressed", "false");
      });

      test("toggles like state on click", () => {
        const mockOnChange = jest.fn();
        render(<HeartLike liked={false} onChange={mockOnChange} />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(mockOnChange).toHaveBeenCalledWith(true);
      });

      test("toggles unlike state on click", () => {
        const mockOnChange = jest.fn();
        render(<HeartLike liked={true} onChange={mockOnChange} />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(mockOnChange).toHaveBeenCalledWith(false);
      });

      test("handles uncontrolled state", () => {
        render(<HeartLike initialLiked={false} onChange={() => {}} />);

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(button);
        expect(button).toHaveAttribute("aria-pressed", "true");
      });

      test("does not change when disabled", () => {
        const mockOnChange = jest.fn();
        render(
          <HeartLike liked={false} onChange={mockOnChange} disabled={true} />,
        );

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(mockOnChange).not.toHaveBeenCalled();
        expect(button).toBeDisabled();
      });

      test("applies custom className", () => {
        const mockOnChange = jest.fn();
        render(
          <HeartLike
            liked={false}
            onChange={mockOnChange}
            className="custom-class"
          />,
        );

        const button = screen.getByRole("button");
        expect(button).toHaveClass("custom-class");
      });

      test("uses custom ariaLabel", () => {
        const mockOnChange = jest.fn();
        render(
          <HeartLike
            liked={false}
            onChange={mockOnChange}
            ariaLabel="Custom label"
          />,
        );

        const button = screen.getByRole("button", { name: "Custom label" });
        expect(button).toBeInTheDocument();
      });
    });

    describe("LoadingMessage Component", () => {
      test("renders default loading message", () => {
        render(<LoadingMessage />);

        expect(screen.getByText("Cargando...")).toBeInTheDocument();
      });

      test("renders custom message", () => {
        render(<LoadingMessage text="Loading data..." />);

        expect(screen.getByText("Loading data...")).toBeInTheDocument();
      });

      test("applies styles correctly", () => {
        render(<LoadingMessage />);

        const message = screen.getByText("Cargando...");
        expect(message).toHaveClass("loading-message");
      });
    });
  });

  describe("Header Component", () => {
    beforeEach(() => {
      jest.spyOn(window, "addEventListener").mockImplementation(() => {});
      jest.spyOn(window, "removeEventListener").mockImplementation(() => {});
    });

    afterEach(() => {
      window.addEventListener.mockRestore();
      window.removeEventListener.mockRestore();
    });

    test("renders header with logo and navigation", () => {
      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: { id: 1, role: "CLIENT" } }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
      expect(screen.getByText("Rutinas")).toBeInTheDocument();
      expect(screen.getByText("Ejercicios")).toBeInTheDocument();
      expect(screen.getByText("Historial")).toBeInTheDocument();
    });

    test("displays active workout badge when workout is active", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockWorkouts = [
        { id: 1, routineName: "Test Routine", endTime: null },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success(mockWorkouts));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("🏋️ Entrenamiento Activo")).toBeInTheDocument();
      });
    });

    test("navigates to workout on active workout click", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockWorkouts = [
        { id: 123, routineName: "Test Routine", endTime: null },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success(mockWorkouts));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const activeWorkoutButton = screen.getByText("🏋️ Entrenamiento Activo");
        fireEvent.click(activeWorkoutButton);
        expect(mockNavigate).toHaveBeenCalledWith("/workouts/session/123");
      });
    });

    test("shows followers link for trainers", async () => {
      const mockUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Seguidores (0)")).toBeInTheDocument();
      });
    });

    test("shows moderation link for admins", async () => {
      const mockUser = { id: 1, role: "ADMIN" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Moderación")).toBeInTheDocument();
      });
    });

    test("toggles profile dropdown on profile button click", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const profileButton = screen
          .getByAltText("Foto de perfil")
          .closest("button");
        fireEvent.click(profileButton);
        expect(screen.getByText("Ver Perfil")).toBeInTheDocument();
        expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
      });
    });

    test("navigates to profile on view profile click", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const profileButton = screen
          .getByAltText("Foto de perfil")
          .closest("button");
        fireEvent.click(profileButton);
        fireEvent.click(screen.getByText("Ver Perfil"));
        expect(mockNavigate).toHaveBeenCalledWith("/users/profile/1");
      });
    });

    test("logs out and navigates to login on logout click", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const profileButton = screen
          .getByAltText("Foto de perfil")
          .closest("button");
        fireEvent.click(profileButton);
        fireEvent.click(screen.getByText("Cerrar Sesión"));
        expect(logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/users/login");
      });
    });

    test("closes dropdown when clicking outside", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const profileButton = screen
          .getByAltText("Foto de perfil")
          .closest("button");
        fireEvent.click(profileButton);
        expect(screen.getByText("Ver Perfil")).toBeInTheDocument();

        fireEvent.mouseDown(document.body);
        expect(screen.queryByText("Ver Perfil")).not.toBeInTheDocument();
      });
    });

    test("toggles notifications popup", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const notificationButton = screen
          .getByAltText("Notificaciones")
          .closest("button");
        fireEvent.click(notificationButton);
        expect(screen.getByText("Notificaciones")).toBeInTheDocument();
      });
    });

    test("closes notifications when opening profile dropdown", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const notificationButton = screen
          .getByAltText("Notificaciones")
          .closest("button");
        fireEvent.click(notificationButton);
        expect(screen.getByText("Notificaciones")).toBeInTheDocument();

        const profileButton = screen
          .getByAltText("Foto de perfil")
          .closest("button");
        fireEvent.click(profileButton);

        expect(screen.queryByText("Notificaciones")).not.toBeInTheDocument();
        expect(screen.getByText("Ver Perfil")).toBeInTheDocument();
      });
    });

    test("handles tryLoginFromServiceToken error gracefully", async () => {
      tryLoginFromServiceToken.mockImplementation((success, error) =>
        error(new Error("Auth failed")),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
        expect(screen.queryByText("Ver Perfil")).not.toBeInTheDocument();
      });
    });

    test("handles checkActiveWorkout error gracefully", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success, error) =>
        error(new Error("Workout service error")),
      );
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
        expect(
          screen.queryByText("🏋️ Entrenamiento Activo"),
        ).not.toBeInTheDocument();
      });
    });

    test("handles checkFollowers error gracefully", async () => {
      const mockUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success, error) =>
        error(new Error("Followers service error")),
      );

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
        expect(screen.getByText("Seguidores (0)")).toBeInTheDocument();
      });
    });

    test("handles getUserNotifications error gracefully", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success, error) =>
        error(new Error("Notifications service error")),
      );
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
        expect(screen.getByText("Rutinas")).toBeInTheDocument();
      });
    });

    test("handles routine deletion event and refreshes notifications", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockNotifications = [
        { id: 1, message: "Test notification", isRead: false },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications
        .mockImplementationOnce((success) => success(mockNotifications))
        .mockImplementationOnce((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
      });

      window.dispatchEvent(new CustomEvent("routineDeleted"));

      await waitFor(() => {
        expect(getUserNotifications).toHaveBeenCalledTimes(3);
      });
    });

    test("handles refreshNotifications error gracefully", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockNotifications = [
        { id: 1, message: "Test notification", isRead: false },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications
        .mockImplementationOnce((success) => success(mockNotifications))
        .mockImplementationOnce((success, error) =>
          error(new Error("Refresh failed")),
        );
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByAltText("Logo medgym")).toBeInTheDocument();
      });

      window.dispatchEvent(new CustomEvent("routineDeleted"));

      await waitFor(() => {
        expect(screen.getByText("Rutinas")).toBeInTheDocument();
      });
    });

    test("notification popup onClose handler works correctly", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockNotifications = [
        { id: 1, message: "Test notification", isRead: false },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) =>
        success(mockNotifications),
      );
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const notificationButton = screen
          .getByAltText("Notificaciones")
          .closest("button");
        fireEvent.click(notificationButton);
        expect(screen.getByText("Notificaciones")).toBeInTheDocument();
      });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText("Notificaciones")).not.toBeInTheDocument();
      });
    });

    test("notification popup onNotificationRead handler works for delete action", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockNotifications = [
        { id: 1, message: "Test notification", isRead: false, routineId: 1 },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) =>
        success(mockNotifications),
      );
      getFollowers.mockImplementation((userId, success) => success([]));
      deleteNotification.mockImplementation((id, success) => success());

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const notificationButton = screen
          .getByAltText("Notificaciones")
          .closest("button");
        fireEvent.click(notificationButton);
        expect(screen.getByText("Test notification")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("✕");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("Test notification")).not.toBeInTheDocument();
        expect(deleteNotification).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
      });
    });

    test("notification popup onNotificationRead handler works for read action", async () => {
      const mockUser = { id: 1, role: "CLIENT" };
      const mockNotifications = [
        { id: 1, message: "Test notification", isRead: false, type: "ROUTINE_LIKE", idToRedirect: 1 },
      ];

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) =>
        success(mockNotifications),
      );
      getFollowers.mockImplementation((userId, success) => success([]));
      markNotificationAsRead.mockImplementation((id, success) => success());

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const notificationButton = screen
          .getByAltText("Notificaciones")
          .closest("button");
        fireEvent.click(notificationButton);
        expect(screen.getByText("Test notification")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Test notification"));

      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(
          1,
          expect.any(Function),
          expect.any(Function),
        );
        expect(mockNavigate).toHaveBeenCalledWith("/routines/1");
      });
    });

    test("routines link shows active state on routines page", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter initialEntries={["/routines"]}>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const routinesLink = screen.getByText("Rutinas").closest("a");
        expect(routinesLink).toHaveClass("active");
      });
    });

    test("exercises link shows active state on exercises page", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter initialEntries={["/exercises"]}>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const exercisesLink = screen.getByText("Ejercicios").closest("a");
        expect(exercisesLink).toHaveClass("active");
      });
    });

    test("history link shows active state on history page", async () => {
      const mockUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter initialEntries={["/workouts/history"]}>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const historyLink = screen.getByText("Historial").closest("a");
        expect(historyLink).toHaveClass("active");
      });
    });

    test("trainer followers link shows active state on followers page", async () => {
      const mockUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter initialEntries={["/users/followers"]}>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const followersLink = screen.getByText("Seguidores (0)").closest("a");
        expect(followersLink).toHaveClass("active");
      });
    });

    test("admin moderation link shows active state on moderation page", async () => {
      const mockUser = { id: 1, role: "ADMIN" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: mockUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter initialEntries={["/users/moderation"]}>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        const moderationLink = screen.getByText("Moderación").closest("a");
        expect(moderationLink).toHaveClass("active");
        expect(moderationLink).toHaveClass("admin-link");
      });
    });

    test("conditionally renders trainer followers link only for trainers", async () => {
      const clientUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: clientUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.queryByText(/Seguidores/)).not.toBeInTheDocument();
      });

      const trainerUser = { id: 1, role: "TRAINER" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: trainerUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Seguidores (0)")).toBeInTheDocument();
      });
    });

    test("conditionally renders admin moderation link only for admins", async () => {
      const clientUser = { id: 1, role: "CLIENT" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: clientUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.queryByText("Moderación")).not.toBeInTheDocument();
      });

      const adminUser = { id: 1, role: "ADMIN" };

      tryLoginFromServiceToken.mockImplementation((success) =>
        success({ user: adminUser }),
      );
      getWorkouts.mockImplementation((success) => success([]));
      getUserNotifications.mockImplementation((success) => success([]));
      getFollowers.mockImplementation((userId, success) => success([]));

      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Moderación")).toBeInTheDocument();
      });
    });
  });
});
