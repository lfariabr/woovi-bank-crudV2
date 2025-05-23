import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';

import { accountField } from '../accountFields';
import { Account } from '../accountModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import mongoose from 'mongoose';
import { AccountType } from '../accountType';

type AccountAddedPayload = {
	account: string;
};

const subscription = subscriptionWithClientId({
	name: 'AccountAdded',
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.ACCOUNT.ADDED),
		async (payload: AccountAddedPayload) => {
			const account = await Account.findOne({
				_id: new mongoose.Types.ObjectId(payload.account),
			});

			if (!account) {
				return false;
			}

			return true;
		}
	),
	getPayload: async (obj: AccountAddedPayload) => {
		// console.log('AccountAddedSubscription getPayload', obj);
		if (!obj || !obj.account) return {};
		return { account: obj.account };
	},
	outputFields: {
		account: {
			type: AccountType,
			resolve: async (obj: any, _, context) => {
				// console.log('account resolve', obj);
				if (!obj || !obj.account) return null;
				return await Account.findOne({
				  _id: new mongoose.Types.ObjectId(obj.account),
				});
			},
			},
	},
});

export const AccountAddedSubscription = {
	...subscription,
};