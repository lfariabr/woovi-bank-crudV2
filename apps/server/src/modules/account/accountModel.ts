import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { authService } from './auth.service';

const SALT_ROUNDS = 10;

const Schema = new mongoose.Schema<IAccount>(
	{
		first_name: {
			type: String,
			description: 'The first name of the account owner',
			trim: true,
			required: [true, 'First name is required'],
		},
		last_name: {
			type: String,
			description: 'The last name of the account owner',
			trim: true,
			required: [true, 'Last name is required'],
		},
		email: {
			type: String,
			description: 'The email of the account owner',
			unique: true,
			required: [true, 'Email is required'],
			trim: true,
			lowercase: true,
			validate: {
				validator: (v: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
				message: 'Please enter a valid email address',
			},
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password must be at least 8 characters long'],
			select: false,
		},
		taxId: {
			type: String,
			description: 'The tax id of the account owner',
			unique: true,
			required: [true, 'Tax id is required'],
			trim: true,
			validate: {
				validator: (v: string) => /^[0-9]{11}$/.test(v),
				message: 'Please enter a valid CPF',
			},
		},
		accountId: {
			type: String,
			description: 'The account id of the account owner',
			unique: true,
			required: true,
			trim: true,
			validate: {
				// validator: (v: string) => /^[0-9]{11}$/.test(v),
				validator: (v: string) => /^[0-9]+$/.test(v),
				message: 'Please enter a valid account id',
			},
		},
		balance: {
			type: Number,
			default: 0,
			description: 'The balance of the account',
		},
		isActive: {
			type: Boolean,
			description: 'The active status of the account',
			default: true,
		},
	},
	{
		collection: 'Account',
		timestamps: true,
		toJSON: {
			transform: function(doc, ret) {
				delete ret.password;
				return ret;
			}
		}
	}
);

// Middleware to hash PWD
Schema.pre('save', async function(next) {
	if (!this.isModified('password')) return next();
	this.password = await authService.hashPassword(this.password);
	try {
		next();
	} catch (error) {
		next(error);
	}
})

Schema.index({ email: 1 }, { unique: true });
Schema.index({ accountId: 1 }, { unique: true });

export type IAccount = {
	first_name: string;
	last_name: string;
	email: string;
	taxId: string;
	accountId: string;
	balance: Number;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	comparePassword(candidatePassword: string): Promise<boolean>;
} & Document;

export const Account: Model<IAccount> = mongoose.model('Account', Schema);
