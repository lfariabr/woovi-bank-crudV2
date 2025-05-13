import { GraphQLObjectType } from 'graphql';

import { messageSubscriptions } from '../modules/message/subscriptions/messageSubscriptions';
import { accountSubscriptions } from '../modules/account/subscriptions/accountSubscriptions';
import { transactionSubscriptions } from '../modules/transaction/subscriptions/transactionSubscription';

export const SubscriptionType = new GraphQLObjectType<any, any>({
	name: 'Subscription',
	fields: () => ({
		...messageSubscriptions,
		...accountSubscriptions,
		...transactionSubscriptions,
	}),
});
