import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
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
			resolve: (transaction) => transaction.account_id_sender,
		},
		account_id_receiver: {
			type: GraphQLString,
			resolve: (transaction) => transaction.account_id_receiver,
		},
		amount: {
			type: GraphQLString,
			resolve: (transaction) => transaction.amount,
		},
		createdAt: {
			type: GraphQLString,
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
