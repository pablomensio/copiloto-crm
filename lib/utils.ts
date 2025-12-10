/**
 * Utility to merge class names.
 * Simplified version to avoid dependency on clsx/tailwind-merge if they are missing.
 */
export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
