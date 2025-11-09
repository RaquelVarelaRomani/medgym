import { useState, useEffect, useRef } from "react";
import styles from "./CommentModal.module.css";

export default function CommentModal({ open, onClose, comments }) {
    const [text, setText] = useState("");
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [comments, open]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>Comentarios</h3>

                <div ref={listRef} className={styles.list}>
                    {(!comments || comments.length === 0) && (
                        <div className={styles.empty}>No hay comentarios aún</div>
                    )}

                    {comments && comments.map(c => (
                        <div key={c.id} className={styles.comment}>
                            <div className={styles.headerRow}>
                                <img
                                    src={`data:image/jpeg;base64,${c.userProfilePicture}`}
                                    className={styles.avatar}
                                    alt=""
                                />
                                <div className={styles.meta}>
                                    <span className={styles.author}>
                                        {c.userName} {c.userSurname}
                                    </span>
                                    <span className={styles.date}>
                                        {new Date(c.date).toLocaleString("es-ES", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.text}>
                                {c.text}
                            </div>
                        </div>
                    ))}
                </div>

                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Añadir comentario..."
                    className={styles.input}
                />

                <div className={styles.actions}>
                    <button className={styles.cancel} onClick={onClose}>
                        Cerrar
                    </button>
                    <button
                        className={styles.send}
                        onClick={() => {
                            setText("");
                        }}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}
