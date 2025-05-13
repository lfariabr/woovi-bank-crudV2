import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import { Transaction } from '../transactionModel';
import { transactionField } from '../transactionFields';

export type CreateTransactionInput = {
    account_id_sender: string;
    account_id_receiver: string;
    amount: string;
};

const mutation = mutationWithClientMutationId({
    name: 'CreateTransaction',
    inputFields: {
        account_id_sender: {
            type: new GraphQLNonNull(GraphQLString),
        },
        account_id_receiver: {
            type: new GraphQLNonNull(GraphQLString),
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
        },
    },
    mutateAndGetPayload: async (args: CreateTransactionInput) => {
        try {
            const transaction = await new Transaction({
                account_id_sender: args.account_id_sender,
                account_id_receiver: args.account_id_receiver,
                amount: args.amount,
            }).save();

            console.log('Publishing TRANSACTION.CREATED', { transaction: transaction._id.toString() });
            redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.CREATED, {
                transaction: transaction._id.toString(),
            });

            return {
                transaction: transaction._id.toString(),
            };
        } catch (error) {
            if (error) {
                if (error.code === 11000) {
                    const field = Object.keys(error.keyPattern)[0];
                    throw new Error(`${field} already exists. Please check the data.`);
                }
            }
            throw error;
        }
    },
    outputFields: {
        ...transactionField('transaction'),
    },
});

export const CreateTransactionMutation = {
    ...mutation,
};