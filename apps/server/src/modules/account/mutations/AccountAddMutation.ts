import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import mongoose from 'mongoose';
import { Account } from '../accountModel';
import { accountField } from '../accountFields';

export type AccountAddInput = {
    first_name: string;
    last_name: string;
    email: string;
    taxId: string;
    accountId: string;
    balance: string;
};

const mutation = mutationWithClientMutationId({
    name: 'AccountAdd',
    inputFields: {
        first_name: {
            type: new GraphQLNonNull(GraphQLString),
        },
        last_name: {
            type: new GraphQLNonNull(GraphQLString),
        },
        email: {
            type: new GraphQLNonNull(GraphQLString),
        },
        taxId: {
            type: new GraphQLNonNull(GraphQLString),
        },
        accountId: {
            type: new GraphQLNonNull(GraphQLString),
        },
        balance: {
            type: new GraphQLNonNull(GraphQLString),
        },
    },
    mutateAndGetPayload: async (args: AccountAddInput) => {
        try {
            const account = await new Account({
                first_name: args.first_name,
                last_name: args.last_name,
                email: args.email,
                taxId: args.taxId,
            accountId: args.accountId,
            balance: new mongoose.Types.Decimal128(args.balance),
        }).save();

        console.log('Publishing ACCOUNT.ADDED', { account: account._id.toString() });
        redisPubSub.publish(PUB_SUB_EVENTS.ACCOUNT.ADDED, {
            account: account._id.toString(),
        });

        return {
            account: account._id.toString(),
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
        ...accountField('account'),
    },
});

export const AccountAddMutation = {
    ...mutation,
};
