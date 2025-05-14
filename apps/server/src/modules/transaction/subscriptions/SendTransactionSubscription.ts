import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import mongoose from 'mongoose';
import { Transaction } from '../transactionModel';
import { TransactionType } from '../transactionType';

type SendTransactionPayload = {
	transaction: string;
};

const subscription = subscriptionWithClientId({
	name: 'SendTransactionSubscription',
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.TRANSACTION.SENT),
		async (payload: SendTransactionPayload) => {
			const transaction = await Transaction.findOne({
				_id: new mongoose.Types.ObjectId(payload.transaction),
			});

			if (!transaction) {
				return false;
			}

			return true;
		}
	),
	getPayload: async (obj: SendTransactionPayload) => {
		// console.log('AccountAddedSubscription getPayload', obj);
		if (!obj || !obj.transaction) return {};
		return { transaction: obj.transaction };
	},
	outputFields: {
		transaction: {
			type: TransactionType,
			resolve: async (obj: any, _, context) => {
				// console.log('account resolve', obj);
				if (!obj || !obj.transaction) return null;
				return await Transaction.findOne({
				  _id: new mongoose.Types.ObjectId(obj.transaction),
				});
			},
			},
	},
});

export const SendTransactionSubscription = {
	...subscription,
};