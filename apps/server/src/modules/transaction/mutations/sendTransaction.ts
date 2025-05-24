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
            resolve: (payload: { transaction: any }) => payload.transaction,
        },
    },
    mutateAndGetPayload: async ({ account_id_sender, account_id_receiver, amount }) => {
        try {
            // Try direct IDs first, then fall back to decoding if necessary
            let senderId, receiverId;
            
            try {
                // First try: Treat the IDs as direct MongoDB ObjectIds
                senderId = account_id_sender;
                receiverId = account_id_receiver;
                
                if (!/^[0-9a-f]{24}$/i.test(senderId) || !/^[0-9a-f]{24}$/i.test(receiverId)) {
                    // Fall back to Relay Global ID decoding
                    const decoded_sender = fromGlobalId(account_id_sender);
                    const decoded_receiver = fromGlobalId(account_id_receiver);
                    
                    if (!decoded_sender || !decoded_sender.id) {
                        throw new Error('Invalid sender ID format');
                    }
                    
                    if (!decoded_receiver || !decoded_receiver.id) {
                        throw new Error('Invalid receiver ID format');
                    }
                    
                    senderId = decoded_sender.id;
                    receiverId = decoded_receiver.id;
                }
            } catch (error) {
                console.error('Error processing IDs:', error);
                throw new Error('Failed to process account IDs');
            }
            
            console.log('Processing transaction with IDs:', {
                sender: {
                    original: account_id_sender,
                    decoded: senderId
                },
                receiver: {
                    original: account_id_receiver,
                    decoded: receiverId
                },
                amount
            });

            // Validation and transaction processing
            const transaction = await sendTransaction(senderId, receiverId, amount);

            // Publish to pubsub
            if (transaction && transaction._id) {
                console.log('Publishing TRANSACTION.SENT', { transaction: transaction._id.toString() });
                redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.SENT, {
                    transaction: transaction._id.toString(),
                });
            }
            
            return { transaction };
        } catch (error) {
            console.error('SendTransaction mutation error:', error);
            throw error;
        }
    },
});