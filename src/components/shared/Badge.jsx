import React from 'react';
import { THEME_CLASSES } from '../../utils/theme';

/**
 * Badge Component for tags and statuses
 * @param {string} variant - success, warning, error, info, neutral
 * @param {React.ReactNode} children - label content
 * @param {string} className - extra classes
 */
export default function Badge({ variant = 'neutral', children, className = '' }) {
    const variantClass = THEME_CLASSES.badge[variant] || THEME_CLASSES.badge.neutral;

    return (
        <span className={`${THEME_CLASSES.badge.base} ${variantClass} ${className}`}>
            {children}
        </span>
    );
}
