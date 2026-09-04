import { createHash } from "crypto";

// PayFast wants encodeURIComponent, but with spaces as + and uppercase hex
function payfastEncode(value: string): string {
    return encodeURIComponent(value.trim())
        .replace(/%20/g, "+")
        .replace(
            /[!'()*]/g,
            (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
        );
}

export function generateSignature(
    data: Record<string, string | number | undefined>,
    passphrase?: string,
): string {
    // IMPORTANT: order of keys as inserted, not sorted
    let pairs = Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([key, value]) => `${key}=${payfastEncode(String(value))}`);

    if (passphrase) {
        pairs.push(`passphrase=${payfastEncode(passphrase)}`);
    }

    const paramString = pairs.join("&");
    return createHash("md5").update(paramString).digest("hex");
}
