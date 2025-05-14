// receiveTransaction mutation
// 0) Validate if receiver exists or it's not actual sender
// 1) Credits receiver account
// 2) Creates transaction
// 3) Returns transaction
// 4) Logs transaction into Ledger

import { mutationWithClientMutationId, fromGlobalId } from "graphql-relay";
import { GraphQLString, GraphQLInt, GraphQLNonNull } from "graphql";
import { TransactionType } from "../transactionType";
import { receiveTransaction } from "../services/TransactionService";

export const ReceiveTransactionMutation = mutationWithClientMutationId({
    name: 'ReceiveTransaction',
    inputFields: {
        account_id_receiver: { type: new GraphQLNonNull(GraphQLString) },
        account_id_sender: { type: GraphQLString },
        amount: { type: GraphQLInt },
    },
    outputFields: {
        transaction: {
            type: TransactionType,
            resolve: (payload) => payload.transaction,
        },
    },
    mutateAndGetPayload: async ({ account_id_receiver, account_id_sender, amount }) => {
        // Decode Relay Global IDs
        const receiverId = fromGlobalId(account_id_receiver).id;
        const senderId = account_id_sender ? fromGlobalId(account_id_sender).id : undefined;

        // Validation
        const transaction = await receiveTransaction(receiverId, senderId, amount);
        
        return { transaction };
    },
});
    