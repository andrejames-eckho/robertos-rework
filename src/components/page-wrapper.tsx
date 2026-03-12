"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

export function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="popLayout">
            <motion.main
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ willChange: "opacity", backfaceVisibility: "hidden" }}
                transition={{ 
                    duration: 0.15, 
                    ease: "linear"
                }}
                className="relative z-10 w-full h-full"
            >
                {children}
            </motion.main>
        </AnimatePresence>
    );
}
