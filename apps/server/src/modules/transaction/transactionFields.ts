import { TransactionType, TransactionConnection } from './transactionType';
import { TransactionLoader } from './transactionLoader';
import { connectionArgs } from 'graphql-relay';

export const transactionField = (key: string) => ({
	[key]: {
		type: TransactionType,
		resolve: async (obj: Record<string, unknown>, _, context) =>
			TransactionLoader.load(context, obj.transaction as string),
	},
});
	
export const transactionConnectionField = (key: string) => ({
	[key]: {
		type: TransactionConnection.connectionType,
		args: {
			...connectionArgs,
		},
		resolve: async (_, args, context) => {
			return await TransactionLoader.loadAll(context, args);
		},
	},
});
