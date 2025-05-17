import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Account } from './accountModel';
import { config } from '../../config';
import { redisClient } from '../../modules/pubSub/redisPubSub';

// Adds random piece of data to password before hashing
const SALT_ROUNDS = 10;

console.log('Loaded auth.service.ts with bcryptjs!');

export const authService = {
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    },

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },
    
    async validateCredentials(email: string, password: string) {
        const account = await Account.findOne({ email }).select('+password');
        if (!account) return null;
        return await bcrypt.compare(password, account.password) ? account : null;
    },

    async invalidateToken(token: string): Promise<void> {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET) as { exp: number };
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            
            if (ttl > 0) {
                // Store with prefix to avoid conflicts
                await redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
            }
        } catch (error) {
            console.error('Error invalidating token:', error);
        }
    },

    async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            // Check with the same key format used in invalidateToken
            const exists = await redisClient.exists(`blacklist:${token}`);
            return exists === 1;
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            return false;
        }
    },

    generateToken(accountId: string): string {
        return jwt.sign({ accountId }, config.JWT_SECRET, { expiresIn: '1h' });
    },

    verifyToken(token: string): { accountId: string } {
        try {
          return jwt.verify(token, config.JWT_SECRET) as { accountId: string };
        } catch (error) {
          console.error('Token verification failed:', error);
          throw new Error('Invalid or expired token');
        }
    }
}