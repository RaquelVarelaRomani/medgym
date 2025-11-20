import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import React from "react";

import styles from "./HeartLike.module.css";

export default function HeartLike({
                                      count = 0,
                                      liked,
                                      onChange,
                                      initialLiked = false,
                                      disabled = false,
                                      size = 22,
                                      className = "",
                                      ariaLabel,
                                  }) {
    const isControlled = liked !== undefined;
    const [uLiked, setULiked] = React.useState(initialLiked);
    const currentLiked = isControlled ? liked : uLiked;

    const toggle = () => {
        if (disabled) return;
        const nextLiked = !currentLiked;
        if (!isControlled) setULiked(nextLiked);
        onChange?.(nextLiked);
    };

    const label = ariaLabel ?? (currentLiked ? "Quitar me gusta" : "Dar me gusta");

    return (
        <button
            type="button"
            aria-pressed={currentLiked}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }}
            className={`${styles.heartButton} ${disabled ? styles.disabled : ''} ${className}`}
        >
            <motion.span
                initial={false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={styles.heartWrapper}
            >
                <Heart
                    width={size}
                    height={size}
                    className={currentLiked ? styles.heartLiked : styles.heartUnliked}
                    fill={currentLiked ? "currentColor" : "none"}
                />
                <span className={styles.count}>{count}</span>
                <motion.span
                    key={String(currentLiked)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className={styles.ripple}
                />
            </motion.span>
        </button>
    );
}
