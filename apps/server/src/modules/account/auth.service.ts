import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Account } from './accountModel';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
console.log('Loaded auth.service.ts with bcryptjs!');
export const authService = {
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    },
    
    async validateCredentials(email: string, password: string) {
        const account = await Account.findOne({ email }).select('+password');
        if (!account) return null;
        return await bcrypt.compare(password, account.password) ? account : null;
    },

    generateToken(accountId: string): string {
        return jwt.sign({ accountId }, JWT_SECRET, { expiresIn: '1h' });
    },

    verifyToken(token: string) {
        return jwt.verify(token, JWT_SECRET) as { accountId: string };
    }
};