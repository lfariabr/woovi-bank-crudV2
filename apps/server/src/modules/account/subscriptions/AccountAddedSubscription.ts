import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';

import { accountField } from '../accountFields';
import { Account } from '../accountModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import mongoose from 'mongoose';

type AccountAddedPayload = {
	account: string;
};

const subscription = subscriptionWithClientId({
	name: 'AccountAdded',
    inputFields: {},
	subscribe: withFilter(
        () => redisPubSub.asyncIterator(PUB_SUB_EVENTS.ACCOUNT.ADDED),
        async (payload: AccountAddedPayload, context) => {
          console.log('accountAdded subscription called with: ', payload);
          const account = await Account.findOne({
            _id: new mongoose.Types.ObjectId(payload.account),
          });
          return !!account;
		}
	),
	getPayload: async (obj: AccountAddedPayload) => ({
		account: obj.account,
	}),
	outputFields: {
		...accountField('account'),
	},
});

export const AccountAddedSubscription = {
	...subscription,
};
