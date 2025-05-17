import { GraphQLObjectType } from 'graphql';

import { messageConnectionField } from '../modules/message/messageFields';
import { accountConnectionField } from '../modules/account/accountFields';
import { transactionConnectionField } from '../modules/transaction/transactionFields';
import { AccountType } from '../modules/account/accountType';
import { AccountLoader } from '../modules/account/accountLoader';


export const QueryType = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		...messageConnectionField('messages'),
		...accountConnectionField('accounts'),
		...transactionConnectionField('transactions'),
		me: {
			type: AccountType,
			description: 'Get the currently auth user',
			resolve: async (_, __, context) => {
				console.log('context', context);
				if (!context.accountId) {
					throw new Error('Not authenticated');
				}
				return await AccountLoader.load(context, context.accountId);
			}
		}
	}),
});
