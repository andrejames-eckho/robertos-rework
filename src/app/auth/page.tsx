"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useUser } from "@/lib/user-context";
import { useSettings } from "@/lib/settings-context";

type Mode =
    | 'login'
    | 'setup-name' | 'setup-pin' | 'setup-confirm'
    | 'recovery-name' | 'recovery-pin' | 'recovery-confirm';

export default function AuthPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [mode, setMode] = useState<Mode>('login');
    const [setupName, setSetupName] = useState("");
    const [setupPin, setSetupPin] = useState("");
    const [pinMismatch, setPinMismatch] = useState(false);
    const router = useRouter();
    const { login, addUser, users, isLoading } = useUser();
    const { checkRecoveryCode } = useSettings();

    useEffect(() => {
        if (!isLoading && users.length === 0) {
            setMode('setup-name');
        } else if (!isLoading && users.length > 0 && mode !== 'login') {
            setMode('login');
        }
    }, [isLoading, users.length]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError(false);
            setPinMismatch(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
        setPinMismatch(false);
    };

    const handleSubmit = async () => {
        if (mode === 'login') {
            const success = await login(pin);
            if (success) {
                router.push("/dashboard");
                return;
            }
            // Failed user PIN — check if it's a developer recovery TOTP code
            if (pin.length === 6) {
                const isRecovery = await checkRecoveryCode(pin);
                if (isRecovery) {
                    setPin("");
                    setSetupName("");
                    setSetupPin("");
                    setMode('recovery-name');
                    return;
                }
            }
            setError(true);
            setPin("");

        } else if (mode === 'setup-pin' || mode === 'recovery-pin') {
            setSetupPin(pin);
            setPin("");
            setMode(mode === 'setup-pin' ? 'setup-confirm' : 'recovery-confirm');

        } else if (mode === 'setup-confirm' || mode === 'recovery-confirm') {
            if (pin !== setupPin) {
                setPinMismatch(true);
                setPin("");
                return;
            }
            await addUser({
                id: (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
                name: setupName.trim(),
                pin: setupPin,
                role: 'SUPER_ADMIN'
            });
            const success = await login(setupPin);
            if (success) router.push("/dashboard");
        }
    };

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"];
    const isSetup = mode !== 'login';
    const isRecovery = mode.startsWith('recovery');

    const title: Record<Mode, string> = {
        'login': 'StockTrack',
        'setup-name': 'Welcome',
        'setup-pin': 'Create PIN',
        'setup-confirm': 'Confirm PIN',
        'recovery-name': 'Developer Recovery',
        'recovery-pin': 'Set Recovery PIN',
        'recovery-confirm': 'Confirm Recovery PIN',
    };

    const subtitle: Record<Mode, string> = {
        'login': 'Enter Kiosk PIN to unlock',
        'setup-name': 'Enter your name to create the admin account',
        'setup-pin': 'Choose a PIN for your account',
        'setup-confirm': 'Enter the PIN again to confirm',
        'recovery-name': 'Enter a name for the new admin account',
        'recovery-pin': 'Choose a PIN for the new account',
        'recovery-confirm': 'Confirm the new PIN',
    };

    const submitLabel: Record<Mode, string> = {
        'login': 'Unlock',
        'setup-pin': 'Next',
        'setup-confirm': 'Create Account',
        'recovery-pin': 'Next',
        'recovery-confirm': 'Create Account',
        'setup-name': 'Next',
        'recovery-name': 'Next',
    };

    if (mode === 'setup-name' || mode === 'recovery-name') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-dark p-8 rounded-3xl w-full max-w-md flex flex-col gap-8 items-center"
                >
                    <div className="text-center space-y-2">
                        <div className={`p-4 rounded-2xl inline-block mb-2 ${isRecovery ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
                            <Icon size={32} color={isRecovery ? 'hsl(38 92% 50%)' : 'hsl(var(--primary))'}>
                                <UserPlus />
                            </Icon>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-glow">{title[mode]}</h1>
                        <p className="text-muted-foreground">{subtitle[mode]}</p>
                        {isRecovery && (
                            <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-xl px-3 py-2 mt-1">
                                Recovery mode — creating new admin account
                            </p>
                        )}
                    </div>

                    <Input
                        className="bg-white/5 border-white/10 text-center text-lg h-14"
                        placeholder="Full name"
                        value={setupName}
                        onChange={e => setSetupName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && setupName.trim()) {
                                setMode(mode === 'setup-name' ? 'setup-pin' : 'recovery-pin');
                            }
                        }}
                        autoFocus
                        maxLength={50}
                    />

                    <Button
                        className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
                            setupName.trim()
                                ? isRecovery ? "bg-amber-500 hover:bg-amber-500/80 text-black" : "bg-primary hover:bg-primary/80"
                                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                        disabled={!setupName.trim()}
                        onClick={() => setMode(mode === 'setup-name' ? 'setup-pin' : 'recovery-pin')}
                    >
                        Next <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark p-8 rounded-3xl w-full max-w-md flex flex-col gap-8 items-center"
            >
                <div className="text-center space-y-2">
                    <div className={`p-4 rounded-2xl inline-block mb-2 ${isRecovery ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
                        <Icon size={32} color={isRecovery ? 'hsl(38 92% 50%)' : 'hsl(var(--primary))'}>
                            {isSetup ? <UserPlus /> : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            )}
                        </Icon>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-glow">{title[mode]}</h1>
                    <p className="text-muted-foreground">{subtitle[mode]}</p>
                    {isRecovery && (
                        <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-xl px-3 py-2 mt-1">
                            Recovery mode — creating new admin account
                        </p>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                pin.length > i
                                    ? isRecovery
                                        ? "bg-amber-500 border-amber-500"
                                        : "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                    : "border-muted-foreground/30"
                            } ${(error || pinMismatch) ? "bg-destructive border-destructive animate-bounce" : ""}`}
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
                                className={`h-16 w-16 text-2xl rounded-2xl glass transition-all active:scale-90 ${
                                    isRecovery
                                        ? "hover:bg-amber-500/20 hover:text-amber-400"
                                        : "hover:bg-primary/20 hover:text-primary"
                                }`}
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
                    className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
                        pin.length >= 4
                            ? isRecovery
                                ? "bg-amber-500 hover:bg-amber-500/80 text-black"
                                : "bg-primary hover:bg-primary/80"
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    }`}
                    disabled={pin.length < 4}
                    onClick={handleSubmit}
                >
                    {submitLabel[mode]} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {(mode === 'setup-confirm' || mode === 'recovery-confirm') && (
                    <button
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => {
                            setPin("");
                            setPinMismatch(false);
                            setMode(mode === 'setup-confirm' ? 'setup-pin' : 'recovery-pin');
                        }}
                    >
                        ← Re-enter PIN
                    </button>
                )}
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
                {pinMismatch && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 text-destructive font-medium"
                    >
                        PINs do not match. Please try again.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
