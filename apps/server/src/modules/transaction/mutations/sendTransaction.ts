// sendTransaction mutation
// 0) Validate sufficient balance
// 1) Debits sender account
// 2) Credits receiver account
// 3) Creates transaction
// 4) Returns transaction

import { sendTransaction } from "../services/TransactionService";
import { mutationWithClientMutationId, fromGlobalId } from "graphql-relay";
import { GraphQLString, GraphQLInt, GraphQLNonNull } from "graphql";
import { TransactionType } from "../transactionType";
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

export const SendTransactionMutation = mutationWithClientMutationId({
    name: 'SendTransaction',
    inputFields: {
        account_id_sender: { type: new GraphQLNonNull(GraphQLString) },
        account_id_receiver: { type: new GraphQLNonNull(GraphQLString) },
        amount: { type: new GraphQLNonNull(GraphQLInt) },
    },
    outputFields: {
        transaction: {
            type: TransactionType,
            resolve: (payload) => payload.transaction,
        },
    },
    mutateAndGetPayload: async ({ account_id_sender, account_id_receiver, amount }) => {
        // Decode Relay Global IDs
        const senderId = fromGlobalId(account_id_sender).id;
        const receiverId = fromGlobalId(account_id_receiver).id;

        // Validation
        const transaction = await sendTransaction(senderId, receiverId, amount);

        // Publish to pubsub
        console.log('Publishing TRANSACTION.SENT', { transaction: transaction._id.toString() });
		redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.SENT, {
			transaction: transaction._id.toString(),
		});
        
        return { transaction };
    },
});