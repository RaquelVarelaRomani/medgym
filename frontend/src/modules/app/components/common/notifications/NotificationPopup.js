import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationPopup.module.css";
import {markNotificationAsRead, deleteNotification} from "../../../../../backend/notificationService";
import PropTypes from "prop-types";

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

    const handleNotificationClick = (notification) => {
        markNotificationAsRead(
            notification.id,
            () => {
                if (onNotificationRead) onNotificationRead(notification.id, "read");
                switch (notification.type) {
                    case "NEW_ROUTINE":
                    case "ROUTINE_LIKE":
                        navigate(`/routines/${notification.idToRedirect}`);
                        break;
                    case "WORKOUT_COMMENT":
                    case "WORKOUT_LIKE":
                        navigate(`/workouts/history`);
                        break;
                    case "FOLLOW":
                        navigate(`/users/profile/${notification.idToRedirect}`);
                        break;
                }
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
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`${styles.item} ${n.isRead ? styles.read : styles.unread}`}
                        >
                            <button
                                type="button"
                                className={styles.content}
                                onClick={() => handleNotificationClick(n)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") handleNotificationClick(n);
                                }}
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
                            </button>
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

NotificationPopup.propTypes = {
    notifications: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            message: PropTypes.string.isRequired,
            date: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
                PropTypes.instanceOf(Date)
            ]).isRequired,
            isRead: PropTypes.bool,
            type: PropTypes.string.isRequired,
            idToRedirect: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ),
    onClose: PropTypes.func.isRequired,
    onNotificationRead: PropTypes.func,
};