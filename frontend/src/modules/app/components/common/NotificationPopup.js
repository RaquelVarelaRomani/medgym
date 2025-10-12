import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationPopup.module.css";
import {markNotificationAsRead, deleteNotification} from "../../../../backend/notificationService";

const NotificationPopup = ({ notifications = [], onClose, onNotificationRead }) => {
    const popupRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleNotificationClick = (notificationId, routineId) => {
        markNotificationAsRead(
            notificationId,
            () => {
                if (onNotificationRead) onNotificationRead(notificationId, "read");
                navigate(`/routines/${routineId}`);
                onClose();
            },
            (error) => console.error("Error marking notification as read:", error)
        );
    };

    const handleDeleteNotification = (notificationId, e) => {
        e.stopPropagation();
        deleteNotification(
            notificationId,
            () => {
                if (onNotificationRead) onNotificationRead(notificationId, "delete");
            },
            (error) => console.error("Error deleting notification:", error)
        );
    };

    return (
        <div className={styles.popup} ref={popupRef}>
            <div className={styles.header}>
                <span>Notificaciones</span>
            </div>
            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty}>Sin notificaciones</div>
                ) : (
                    notifications.map((n, index) => (
                        <div
                            key={index}
                            className={`${styles.item} ${n.isRead ? styles.read : styles.unread}`}
                        >
                            <div
                                className={styles.content}
                                onClick={() => handleNotificationClick(n.id, n.routineId)}
                            >
                                <div className={styles.text}>{n.message}</div>
                                <div className={styles.date}>
                                    {new Date(n.date).toLocaleString("es-ES", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                            <button
                                className={styles.deleteButton}
                                onClick={(e) => handleDeleteNotification(n.id, e)}
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;
