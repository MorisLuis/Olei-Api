import type { VerifyOptions } from "jsonwebtoken";

export const extractBearerToken = (headerValue: string | string[] | undefined): string | null => {
    if (typeof headerValue !== 'string') return null;
    const [scheme, token, ...rest] = headerValue.trim().split(/\s+/);
    if (rest.length > 0) return null;
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
    return token;
};

export const buildVerifyOptions = (issuer?: string, audience?: string, subject?: string): VerifyOptions => {
    const options: VerifyOptions = { algorithms: ['HS256'] };
    if (issuer) options.issuer = issuer;
    if (audience) options.audience = audience;
    if (subject) options.subject = subject;
    return options;
};