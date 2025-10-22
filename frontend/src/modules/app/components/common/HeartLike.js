import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import React from "react";

import styles from "./HeartLike.module.css";

export default function HeartLike({
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
            className={[
                "inline-flex items-center justify-center select-none rounded-full p-0 m-0",
                "bg-transparent border-0 shadow-none outline-none",
                "focus:outline-none focus-visible:ring-0",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                className,
            ].join(" ")}
        >
            <motion.span
                initial={false}
                animate={{ scale: currentLiked ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative inline-flex"
            >
                <Heart
                    width={size}
                    height={size}
                    className={currentLiked ? "text-red-600" : "text-neutral-600 dark:text-neutral-300"}
                    fill={currentLiked ? "currentColor" : "none"}
                />
                <motion.span
                    key={String(currentLiked)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                />
            </motion.span>
        </button>
    );
}
