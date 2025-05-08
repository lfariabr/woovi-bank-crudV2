import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { IAccount } from './accountModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { AccountLoader } from './accountLoader';

const AccountType = new GraphQLObjectType<IAccount>({
	name: 'Account',
	description: 'Represents an account',
	fields: () => ({
		id: globalIdField('Account'),
		first_name: {
			type: GraphQLString,
			resolve: (account) => account.first_name,
		},
		last_name: {
			type: GraphQLString,
			resolve: (account) => account.last_name,
		},
		email: {
			type: GraphQLString,
			resolve: (account) => account.email,
		},
		taxId: {
			type: GraphQLString,
			resolve: (account) => account.taxId,
		},
		accountId: {
			type: GraphQLString,
			resolve: (account) => account.accountId,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (account) => account.createdAt.toISOString(),
		},
	}),
	interfaces: () => [nodeInterface],
});

const AccountConnection = connectionDefinitions({
	name: 'Account',
	nodeType: AccountType,
});

registerTypeLoader(AccountType, AccountLoader.load);

export { AccountType, AccountConnection };
