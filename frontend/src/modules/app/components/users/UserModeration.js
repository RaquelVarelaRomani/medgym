import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {tryLoginFromServiceToken} from "../../../../backend/userService";
import * as adminService from "../../../../backend/adminService";
import ConfirmationPopup from "../common/popup/ConfirmationPopup";
import styles from "./UserModeration.module.css";
import LoadingMessage from "../common/LoadingMessage";

const UserModeration = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [userToBlock, setUserToBlock] = useState(null);
    const [userToUnblock, setUserToUnblock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser.user.role !== 'ADMIN') {
                    console.error("Access denied: admin only");
                    navigate("/");
                    return;
                }
                setCurrentUser(authenticatedUser.user);
                fetchUsers();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
    }, [navigate]);

    const fetchUsers = () => {
        setLoading(true);
        adminService.getAllUsers(
            (data) => {
                setUsers(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        );
    };
    const handleBlockUser = (userId) => {
        adminService.blockUser(
            userId,
            () => {
                console.log("User blocked successfully");
                fetchUsers(); //reload list
                setUserToBlock(null);
            },
            (error) => {
                console.error("Error blocking user:", error);
                setUserToBlock(null);
            }
        );
    };

    const handleUnblockUser = (userId) => {
        adminService.unblockUser(
            userId,
            () => {
                console.log("User unblocked successfully");
                fetchUsers(); //reload list
                setUserToUnblock(null);
            },
            (error) => {
                console.error("Error unblocking user:", error);
                setUserToUnblock(null);
            }
        );
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) return <LoadingMessage text="Cargando usuarios..." />;

    return (
        <div className={styles.contenedor}>
            <h1 className={styles.titulo}>Gestión de Usuarios</h1>

            <div className={styles['search-container']}>
                <h3 className={styles['search-title']}>Buscar usuarios</h3>
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles['search-input']}
                />
            </div>

            <div className={styles['users-count']}>
                Total de usuarios: {filteredUsers.length}
            </div>

            <div className={styles['users-list']}>
                {filteredUsers.length === 0 ? (
                    <p className={styles['no-users']}>No se encontraron usuarios</p>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id}
                             className={`${styles['user-card']} ${user.status === 'BLOCKED' ? styles['blocked'] : ''}`}>
                            <div className={styles['user-info']}>
                                <div className={styles['name-container']}>
                                    <h3>{user.name || user.userName}</h3>
                                </div>
                                <p className={styles['user-email']}>{user.email}</p>
                                {user.role && (
                                    <span className={`${styles['user-role']} ${styles[user.role.toLowerCase()]}`}>
            {user.role}
        </span>
                                )}
                            </div>
                            <div className={styles['user-actions']}>
                                {user.status === 'BLOCKED' ? (
                                    <button
                                        className={styles['unblock-btn']}
                                        onClick={() => setUserToUnblock(user)}
                                        disabled={user.role === 'ADMIN'}
                                    >
                                        Desbloquear
                                    </button>
                                ) : (
                                    <button
                                        className={styles['block-btn']}
                                        onClick={() => setUserToBlock(user)}
                                        disabled={user.role === 'ADMIN'}
                                    >
                                        {user.role === 'ADMIN' ? 'Admin' : 'Bloquear'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationPopup
                text={`¿Estás seguro de que quieres bloquear a ${userToBlock?.name || userToBlock?.userName}?`}
                show={userToBlock !== null}
                onOk={() => {
                    if (userToBlock) {
                        handleBlockUser(userToBlock.id);
                    }
                }}
                onCancel={() => setUserToBlock(null)}
            />

            <ConfirmationPopup
                text={`¿Estás seguro de que quieres desbloquear a ${userToUnblock?.name || userToUnblock?.userName}?`}
                show={userToUnblock !== null}
                onOk={() => {
                    if (userToUnblock) {
                        handleUnblockUser(userToUnblock.id);
                    }
                }}
                onCancel={() => setUserToUnblock(null)}
            />
        </div>
    );
};

export  default UserModeration;