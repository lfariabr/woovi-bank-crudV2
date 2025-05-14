import { SendTransactionMutation } from './sendTransaction';
import { ReceiveTransactionMutation } from './receiveTransaction';

export const transactionMutation = {
    SendTransaction: SendTransactionMutation,
    ReceiveTransaction: ReceiveTransactionMutation,
};