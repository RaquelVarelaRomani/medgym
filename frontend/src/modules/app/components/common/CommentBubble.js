import { motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";
import React from "react";
import styles from "./CommentBubble.module.css";

export default function CommentBubble({
                                          count = 0,
                                          onClick,
                                          disabled = false,
                                          size = 22,
                                          className = "",
                                          ariaLabel = "Comentarios",
                                      }) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick(e);
            }}
            className={`${styles.commentButton} ${disabled ? styles.disabled : ''} ${className}`}
        >
            <motion.span
                initial={false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={styles.commentWrapper}
            >
                <MessageCircleMore
                    width={size}
                    height={size}
                    className={styles.commentIcon}
                />
                <span className={styles.count}>{count}</span>
            </motion.span>
        </button>
    );
}
