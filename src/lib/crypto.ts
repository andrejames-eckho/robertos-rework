import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha1 } from '@noble/hashes/legacy.js';

export function generateSalt(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
}

export async function hashPin(pin: string, saltBase64: string): Promise<string> {
    const encoder = new TextEncoder();
    const saltBytes = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const hash = pbkdf2(sha256, encoder.encode(pin), saltBytes, { c: 100000, dkLen: 32 });
    return btoa(String.fromCharCode(...hash));
}

// --- TOTP (RFC 6238) — developer recovery ---

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => BASE32_ALPHABET[b % 32]).join('');
}

function base32Decode(str: string): Uint8Array {
    const s = str.toUpperCase().replace(/=+$/, '');
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;
    for (const char of s) {
        const idx = BASE32_ALPHABET.indexOf(char);
        if (idx === -1) continue;
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return new Uint8Array(bytes);
}

async function hotp(secret: string, counter: number): Promise<string> {
    const key = base32Decode(secret);
    const msg = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }
    const sig = hmac(sha1, key, msg);
    const offset = sig[sig.length - 1] & 0xf;
    const code = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) |
                 (sig[offset + 2] << 8) | sig[offset + 3];
    return String(code % 1_000_000).padStart(6, '0');
}

export async function verifyTotp(secret: string, input: string): Promise<boolean> {
    const counter = Math.floor(Date.now() / 1000 / 30);
    // Accept current window and one previous (clock drift tolerance)
    const [current, previous] = await Promise.all([
        hotp(secret, counter),
        hotp(secret, counter - 1),
    ]);
    return input === current || input === previous;
}

export function totpUri(secret: string, appName = 'StockTrack'): string {
    return `otpauth://totp/${encodeURIComponent(appName)}%3ARecovery?secret=${secret}&issuer=${encodeURIComponent(appName)}&digits=6&period=30`;
}
