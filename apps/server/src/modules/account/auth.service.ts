import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Account } from './accountModel';
import { config } from '../../config';


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

    generateToken(accountId: string): string {
        return jwt.sign({ accountId }, config.JWT_SECRET, { expiresIn: '1h' });
    },

    verifyToken(token: string) {
        return jwt.verify(token, config.JWT_SECRET) as { accountId: string };
    }
};