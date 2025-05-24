import { Account } from "../../account/accountModel";
import { Transaction } from "../../transaction/transactionModel";
import mongoose from "mongoose";
const MAX_RETRIES = 3;

export async function sendTransaction(senderId: string, receiverId: string, amount: number) {
  console.log(`Starting transaction: from ${senderId} to ${receiverId} amount ${amount}`);
  
  if (senderId === receiverId) throw new Error('Sender and receiver cannot be the same');
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    
    // I understand that this is secure enough for this use case
    // #TODO validate better this approach
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Log the IDs being used for lookup
      console.log(`Looking up accounts: sender=${senderId}, receiver=${receiverId}`);
      
      const [sender, receiver] = await Promise.all([
        Account.findById(senderId).session(session),
        Account.findById(receiverId).session(session),
      ])
      
      console.log('Accounts found:', { 
        sender: sender ? { id: sender._id.toString(), balance: sender.balance } : 'not found', 
        receiver: receiver ? { id: receiver._id.toString(), balance: receiver.balance } : 'not found' 
      });

      if (!sender || !receiver) throw new Error('Sender or receiver account not found');

      if (Number(sender.balance) < amount) {
        throw new Error('Insufficient balance');
      }
      // debit
      const senderUpdate = await Account.updateOne(
        { _id: senderId, __v: sender.__v },
        { $inc: { balance: -amount, __v: 1 } },
        { session }
      );

      // credit
      const receiverUpdate = await Account.updateOne(
        { _id: receiverId, __v: receiver.__v },
        { $inc: { balance: amount, __v: 1 } },
        { session }
      );

      if (senderUpdate.modifiedCount === 0) throw new Error('Insufficient balance or account not found');

      const transaction = await createTransaction(senderId, receiverId, amount, session);

      // TODO: log to Ledger module here

      await session.commitTransaction();
      session.endSession();
      return transaction;

    } catch (error) {
      console.error('Transaction error details:', error);
      console.error(`Attempted to send ${amount} from ${senderId} to ${receiverId}`);
      
      // Log more specific information about the error
      if (error.name === 'CastError') {
        console.error(`CastError details: path=${error.path}, kind=${error.kind}, value=${error.value}`);
      }
      
      await session.abortTransaction();
      session.endSession();
      attempts++;
      console.log(`Transaction failed. Retry attempt ${attempts}/${MAX_RETRIES}...`);

      if (error.message.includes('Insufficient balance')) {
        throw error;
      }

      if (attempts >= MAX_RETRIES) {
        throw new Error('Failed to send transaction after multiple attempts');
      }
      console.warn(`Transaction failed. Retrying... (${attempts}/${MAX_RETRIES})`);
    }
  }
}

export async function createTransaction(senderId: string, receiverId: string, amount: number, session?: mongoose.ClientSession) {
	const docs = await Transaction.create([{
		account_id_sender: senderId,
		account_id_receiver: receiverId,
		amount: mongoose.Types.Decimal128.fromString(amount.toString())
	}], { session });
	return docs[0];
}