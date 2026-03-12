"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

export function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ willChange: "transform, opacity", backfaceVisibility: "hidden" }}
                transition={{ 
                    duration: 0.2, 
                    ease: [0.23, 1, 0.32, 1] // Custom ease-out cubic
                }}
                className="relative z-10 w-full h-full"
            >
                {children}
            </motion.main>
        </AnimatePresence>
    );
}
