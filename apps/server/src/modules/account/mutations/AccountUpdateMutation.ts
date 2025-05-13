import { GraphQLString } from 'graphql';
import { mutationWithClientMutationId, toGlobalId, fromGlobalId } from 'graphql-relay';
// TODO: fromGlobalId implementation for when to use Relay
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import { Account } from '../accountModel';
import { accountField } from '../accountFields';
import mongoose from 'mongoose';


export type AccountUpdateInput = {
    first_name: string;
    last_name: string;
    email: string;
    taxId: string;
    accountId: string;
    balance: string;
};

const mutation = mutationWithClientMutationId({
    name: 'AccountUpdate',
    inputFields: {
        first_name: {
            type: GraphQLString,
        },
        last_name: {
            type: GraphQLString,
        },
        email: {
            type: GraphQLString,
        },
        taxId: {
            type: GraphQLString,
        },
        accountId: {
            type: GraphQLString,
        },
        balance: {
            type: GraphQLString,
        },
    },
    mutateAndGetPayload: async (args: AccountUpdateInput) => {
        try {
            const { id: mongoId } = fromGlobalId(args.accountId);

        const account = await Account.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(mongoId),
        }, {
            first_name: args.first_name,
            last_name: args.last_name,
            email: args.email,
            taxId: args.taxId,
            balance: new mongoose.Types.Decimal128(args.balance),
        }, {
            new: true, // Returns the updated document
        });

        if (!account) {
            throw new Error('Account not found');
        }

        console.log('Publishing ACCOUNT.UPDATED', { account: account._id.toString() });
        redisPubSub.publish(PUB_SUB_EVENTS.ACCOUNT.UPDATED, {
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

export const AccountUpdateMutation = {
    ...mutation,
};
