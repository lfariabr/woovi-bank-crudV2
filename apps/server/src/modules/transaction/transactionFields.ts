import { TransactionType, TransactionConnection } from './transactionType';
import { TransactionLoader } from './transactionLoader';
import { connectionArgs } from 'graphql-relay';
import { GraphQLString, GraphQLFloat } from 'graphql';
import { Types } from 'mongoose';

// Define filter types for better type checking
type TransactionFilter = {
  account_id_sender?: Types.ObjectId;
  account_id_receiver?: Types.ObjectId;
  amount?: { $eq: number };
};

type OrCondition = {
  $or: TransactionFilter[];
};

type FilterCondition = TransactionFilter | OrCondition;

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
			account_id_sender: { type: GraphQLString },
			account_id_receiver: { type: GraphQLString },
			amount: { type: GraphQLFloat },
		},
		resolve: async (_, args, context) => {
			const { account_id_sender, account_id_receiver, amount, ...paginationArgs } = args;
			
			let filters: FilterCondition = {};
			
			// Build filters based on provided parameters
			const filterConditions: FilterCondition[] = [];
				
				// Handle user ID conditions (show transactions where user is either sender OR receiver)
				// If both are provided, check if they're the same (user wants their own transactions)
				if (account_id_sender && account_id_receiver) {
				if (account_id_sender === account_id_receiver) {
					filterConditions.push({
						$or: [
							{ account_id_sender: new Types.ObjectId(account_id_sender) },
							{ account_id_receiver: new Types.ObjectId(account_id_sender) }
						]
					});
				} else {
					// Different IDs - look for specific sender->receiver transactions
					filterConditions.push({ account_id_sender: new Types.ObjectId(account_id_sender) });
					filterConditions.push({ account_id_receiver: new Types.ObjectId(account_id_receiver) });
				}
			} else if (account_id_sender && account_id_sender.trim() !== '') {
				// Just sender provided
				filterConditions.push({
					$or: [
						{ account_id_sender: new Types.ObjectId(account_id_sender) },
						{ account_id_receiver: new Types.ObjectId(account_id_sender) }
					]
				});
			} else if (account_id_receiver && account_id_receiver.trim() !== '') {
				// Just receiver provided
				filterConditions.push({
					$or: [
						{ account_id_sender: new Types.ObjectId(account_id_receiver) },
						{ account_id_receiver: new Types.ObjectId(account_id_receiver) }
					]
				});
			}
			
			// Handle amount filter only if it's a meaningful value (greater than 0)
			if (amount && amount > 0) {
				filterConditions.push({ amount: { $eq: amount } });
			}
			
			// Apply filters if any conditions exist
			if (filterConditions.length === 1) {
				filters = filterConditions[0];
			} else if (filterConditions.length > 1) {
				filters = { $and: filterConditions };
			}
			
			return await TransactionLoader.loadAll(context, { ...paginationArgs, filters });
		},
	},
});