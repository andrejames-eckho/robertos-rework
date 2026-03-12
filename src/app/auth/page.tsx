"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useUser } from "@/lib/user-context";

export default function AuthPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();
    const { login } = useUser();

    const handleNumberClick = (num: string) => {
        if (pin.length < 6) {
            setPin((prev) => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = async () => {
        const success = await login(pin);
        if (success) {
            router.push("/dashboard");
        } else {
            setError(true);
            setPin("");
        }
    };

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark p-8 rounded-3xl w-full max-w-md flex flex-col gap-8 items-center"
            >
                <div className="text-center space-y-2">
                    <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-2">
                        <Icon size={32} color="hsl(var(--primary))">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </Icon>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-glow">StockTrack</h1>
                    <p className="text-muted-foreground">Enter Kiosk PIN to unlock</p>
                </div>

                <div className="flex gap-4 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i
                                ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                : "border-muted-foreground/30"
                                } ${error ? "bg-destructive border-destructive animate-bounce" : ""}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                    {numbers.map((num, i) => (
                        num === "" ? (
                            <div key={`empty-${i}`} />
                        ) : (
                            <Button
                                key={num}
                                variant="ghost"
                                className="h-16 w-16 text-2xl rounded-2xl glass hover:bg-primary/20 hover:text-primary transition-all active:scale-90"
                                onClick={() => handleNumberClick(num)}
                            >
                                {num}
                            </Button>
                        )
                    ))}
                    <Button
                        variant="ghost"
                        className="h-16 w-16 rounded-2xl glass hover:bg-destructive/10 hover:text-destructive active:scale-90"
                        onClick={handleDelete}
                    >
                        <Delete className="w-6 h-6" />
                    </Button>
                </div>

                <Button
                    className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${pin.length >= 4
                        ? "bg-primary hover:bg-primary/80"
                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                    disabled={pin.length < 4}
                    onClick={handleSubmit}
                >
                    Unlock <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 text-destructive font-medium"
                    >
                        Invalid PIN. Please try again.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
