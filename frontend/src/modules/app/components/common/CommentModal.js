import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./CommentModal.module.css";

export default function CommentModal({ open, onSend, onClose, comments }) {
    const [text, setText] = useState("");
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [comments, open]);

    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            role="button"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") onClose();
            }}
        >
            <dialog
                className={styles.modalWrapper}
                open
                onClick={(e) => e.stopPropagation()}   // AHORA ES LEGAL: <dialog> sí es interactivo
            >
                <div className={styles.modal}>
                    <h3>Comentarios</h3>

                    <div ref={listRef} className={styles.list}>
                        {comments?.length === 0 && (
                            <div className={styles.empty}>No hay comentarios aún</div>
                        )}

                        {comments?.map(c => (
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

                                <div className={styles.text}>{c.text}</div>
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
                            disabled={text.trim().length === 0}
                            onClick={() => {
                                onSend(text);
                                setText("");
                            }}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

CommentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onSend: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    comments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            userProfilePicture: PropTypes.string,
            userName: PropTypes.string,
            userSurname: PropTypes.string,
            date: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
                PropTypes.instanceOf(Date)
            ]),
            text: PropTypes.string
        })
    )
};
