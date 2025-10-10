import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {deleteUser, getAllUsers, tryLoginFromServiceToken} from "../../../../backend/userService";
import ConfirmationPopup from "../common/ConfirmationPopup";
import styles from "./UserModeration.module.css";

const UserModeration = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [userToBan, setUserToBan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser.user.role !== 'ADMIN') {
                    console.error("Access denied: Admin only");
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
        getAllUsers(
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

    const handleBanUser = (userId) => {
        console.log("Baneando usuario: ", userId);
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return <div className={styles.contenedor}>Cargando usuarios...</div>;
    }

    return (
        <div className={styles.contenedor}>
            <h1 className={styles.titulo}>Usuarios</h1>

            <div className={styles['search-container']}>
                <h3 className={styles['search-title']}>Buscar usuarios</h3>
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles['search-input']}
                />
            </div>

            <div className={styles['users-count']}>
            Número de usuarios: {filteredUsers.length}
            </div>

            <div className={styles['users-list']}>
                {filteredUsers.length === 0 ? (
                    <p className={styles['no-users']}>No se encontraron usuarios</p>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className={styles['user-card']}>
                            <div className={styles['user-info']}>
                                <h3>{user.name}</h3>
                                <p className={styles['user-email']}>{user.email}</p>
                                {user.role && (
                                    <span className={`${styles['user-role']} ${styles[user.role.toLowerCase()]}`}>
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <div className={styles['user-actions']}>
                                <button
                                    className={styles['boton-ban']}
                                    onClick={() => setUserToBan(user)}
                                    disabled={user.role === 'ADMIN'}
                                >
                                    {user.role === 'ADMIN' ? 'Admin' : 'Banear'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationPopup
                text={`¿Estás seguro de que quieres banear a ${userToBan?.name || userToBan?.userName}?`}
                show={userToBan !== null}
                onOk={() => {
                    if (userToBan) {
                        handleBanUser(userToBan.id);
                    }
                }}
                onCancel={() => setUserToBan(null)}
            />
        </div>
    );
};

export  default UserModeration;