import { 
	GraphQLObjectType,
	GraphQLString,
	GraphQLNonNull,
	GraphQLInputObjectType,
	GraphQLBoolean } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { IAccount } from './accountModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { AccountLoader } from './accountLoader';

const AuthPayloadType = new GraphQLObjectType({
	name: 'AuthPayload',
	fields: () => ({
	  token: { type: new GraphQLNonNull(GraphQLString) },
	  account: { type: new GraphQLNonNull(AccountType) },
	}),
});

const LoginInputType = new GraphQLInputObjectType({
	name: 'LoginInput',
	fields: () => ({
	  email: { type: new GraphQLNonNull(GraphQLString) },
	  password: { type: new GraphQLNonNull(GraphQLString) },
	}),
});

const RegisterInputType = new GraphQLInputObjectType({
	name: 'RegisterInput',
	fields: () => ({
	  email: { type: new GraphQLNonNull(GraphQLString) },
	  password: { type: new GraphQLNonNull(GraphQLString) },
	  firstName: { type: GraphQLString },
	  lastName: { type: GraphQLString },
	  taxId: { type: GraphQLString },
	  accountId: { type: GraphQLString },
	}),
});


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
		token: {
			type: GraphQLString,
			resolve: (account) => (account as any).token,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (account) => account.createdAt.toISOString(),
		},
		balance: {
			type: GraphQLString,
			resolve: (account) => {
				if (account.balance === undefined || account.balance === null) {
					return null;
				}
				return String(account.balance);
			}
		},
		isActive: {
			type: GraphQLBoolean,
			resolve: (account) => account.isActive,
		},
	}),
	interfaces: () => [nodeInterface],
});

const AccountConnection = connectionDefinitions({
	name: 'Account',
	nodeType: AccountType,
});

registerTypeLoader(AccountType, AccountLoader.load);

export { 
	AccountType, 
	AccountConnection, 
	AuthPayloadType, 
	LoginInputType, 
	RegisterInputType 
};
