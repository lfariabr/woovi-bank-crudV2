import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { ITransaction } from './transactionModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { TransactionLoader } from './transactionLoader';

const TransactionType = new GraphQLObjectType<ITransaction>({
	name: 'Transaction',
	description: 'Represents a transaction',
	fields: () => ({
		id: globalIdField('Transaction'),
		account_id_sender: {
			type: GraphQLString,
      		description: 'The account id of the sender of the transaction',
			resolve: (transaction) => transaction.account_id_sender,
		},
		account_id_receiver: {
			type: GraphQLString,
      		description: 'The account id of the receiver of the transaction',
			resolve: (transaction) => transaction.account_id_receiver,
		},
		amount: {
			type: new GraphQLNonNull(GraphQLInt),
      		description: 'Total amount of the transaction in cents',
      		resolve: (transaction) => {
				if (!transaction.amount) return null;
				// If amount is already a number, return as is
				if (typeof transaction.amount === 'number') return transaction.amount;
				// If amount is a Decimal128, convert to number
				if (typeof transaction.amount.toString === 'function') return Number(transaction.amount.toString());
				return null;
			}
		},
		createdAt: {
			type: GraphQLString,
      		description: 'The creation date of the transaction',
			resolve: (transaction) => transaction.createdAt.toISOString(),
		},
	}),
	interfaces: () => [nodeInterface],
});
	
const TransactionConnection = connectionDefinitions({
	name: 'Transaction',
	nodeType: TransactionType,
});

registerTypeLoader(TransactionType, TransactionLoader.load);

export { TransactionType, TransactionConnection };
