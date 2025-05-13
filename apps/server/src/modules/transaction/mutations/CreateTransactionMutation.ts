import { GraphQLString, GraphQLNonNull, GraphQLInt } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import { Transaction } from '../transactionModel';
import { TransactionType } from '../transactionType';
import { TransactionLoader } from '../transactionLoader';

const { fromGlobalId } = require('graphql-relay');

export type CreateTransactionInput = {
    account_id_sender: string;
    account_id_receiver: string;
    amount: number;
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
            type: new GraphQLNonNull(GraphQLInt),
        },
    },
    mutateAndGetPayload: async (args: CreateTransactionInput) => {
        try {
            const transaction = await new Transaction({
                account_id_sender: fromGlobalId(args.account_id_sender).id,
                account_id_receiver: fromGlobalId(args.account_id_receiver).id,
                amount: args.amount,
            }).save();

            console.log('Publishing TRANSACTION.CREATED', { transaction: transaction._id.toString() });
            redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.CREATED, {
                transaction: transaction._id.toString(),
            });

            return {
                transaction: {
                    ...transaction.toObject(),
                    amount: transaction.amount,
                }
            };
        } catch (error) {
            throw error;
        }
    },
    outputFields: {
        transaction: {
            type: TransactionType,
            resolve: async ({ transaction }, _, context) => {
                if (!transaction) return null;
                return TransactionLoader.load(context, transaction._id);
            },
        },
        // accountUpdateBalance TODO
    },
});

export const CreateTransactionMutation = {
    ...mutation,
};