import { Button } from '../ui/button';
import { useMutation } from 'react-relay';
import { TRANSACTION_SEND_MUTATION } from '../../app/transactions/transactionSend';
import { authStore } from '../../lib/auth-store';

type SendTransactionProps = {
    senderObjectId: string;
    receiverObjectId: string;
    amount: number;
}

export const SendTransaction = (props: SendTransactionProps) => {
    const [sendTransactionMutation] = useMutation<typeof TRANSACTION_SEND_MUTATION>(TRANSACTION_SEND_MUTATION);
    const { user } = authStore.getState();
    const currentUserObjectId = user?.id;
    
    const handleSendTransaction = () => {
        sendTransactionMutation({
            variables: {
                input: {
                    account_id_sender: props.senderObjectId,
                    account_id_receiver: props.receiverObjectId,
                    amount: props.amount,
                },
            },
        });
    };

    return (
        <Button
            variant="default"
            onClick={handleSendTransaction}
        >
            Send
        </Button>
    );
}