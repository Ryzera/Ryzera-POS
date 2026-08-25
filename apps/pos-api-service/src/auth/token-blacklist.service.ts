import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
    private blacklistedTokens = new Set<string>();

    blacklist(token: string): void {
        this.blacklistedTokens.add(token);
    }

    isBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }

    // Memory cleanup — expired tokens remove (optional)
    cleanup(): void {
        this.blacklistedTokens.clear();
    }
}