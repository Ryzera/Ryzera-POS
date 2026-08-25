import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
    let service: TokenBlacklistService;

    beforeEach(() => {
        service = new TokenBlacklistService();
    });

    it('should blacklist a token', () => {
        service.blacklist('test-token');
        expect(service.isBlacklisted('test-token')).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
        expect(service.isBlacklisted('valid-token')).toBe(false);
    });

    it('should clear all blacklisted tokens', () => {
        service.blacklist('token-1');
        service.blacklist('token-2');
        service.cleanup();
        expect(service.isBlacklisted('token-1')).toBe(false);
        expect(service.isBlacklisted('token-2')).toBe(false);
    });

    it('should handle multiple tokens', () => {
        service.blacklist('token-a');
        service.blacklist('token-b');
        expect(service.isBlacklisted('token-a')).toBe(true);
        expect(service.isBlacklisted('token-b')).toBe(true);
        expect(service.isBlacklisted('token-c')).toBe(false);
    });
});