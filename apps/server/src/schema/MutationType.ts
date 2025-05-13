import { GraphQLObjectType } from 'graphql';

import { messageMutations } from '../modules/message/mutations/messageMutations';
import { accountMutation } from '../modules/account/mutations/accountMutation';
import { transactionMutation } from '../modules/transaction/mutations/transactionMutation';

export const MutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		...messageMutations,
		...accountMutation,
		...transactionMutation,
	}),
});
