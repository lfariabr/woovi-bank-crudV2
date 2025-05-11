import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<IAccount>(
	{
		first_name: {
			type: String,
			description: 'The first name of the account',
		},
		last_name: {
			type: String,
			description: 'The last name of the account',
		},
		email: {
			type: String,
			description: 'The email of the account',
			unique: true,
		},
		taxId: {
			type: String,
			description: 'The tax id of the account',
			unique: true,
		},
		accountId: {
			type: String,
			description: 'The account id of the account',
			unique: true,
		},
	},
	{
		collection: 'Account',
		timestamps: true,
	}
);

export type IAccount = {
	first_name: string;
	last_name: string;
	email: string;
	taxId: string;
	accountId: string;
	createdAt: Date;
	updatedAt: Date;
} & Document;

export const Account: Model<IAccount> = mongoose.model('Account', Schema);
