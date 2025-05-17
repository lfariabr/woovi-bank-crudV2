import { Account } from "../../account/accountModel";
import { Transaction } from "../../transaction/transactionModel";
import mongoose from "mongoose";
const MAX_RETRIES = 3;

export async function sendTransaction(senderId: string, receiverId: string, amount: number) {
  if (senderId === receiverId) throw new Error('Sender and receiver cannot be the same');
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [sender, receiver] = await Promise.all([
        Account.findById(senderId).session(session),
        Account.findById(receiverId).session(session),
      ])

      if (!sender || !receiver) throw new Error('Sender or receiver account not found');

      // Directly checking balance
      if (Number(sender.balance) < amount) {
        throw new Error('Insufficient balance');
      }
      // Directly debiting
      const senderUpdate = await Account.updateOne(
        { _id: senderId, __v: sender.__v },
        { $inc: { balance: -amount, __v: 1 } },
        { session }
      );

      // Directly crediting
      const receiverUpdate = await Account.updateOne(
        { _id: receiverId, __v: receiver.__v },
        { $inc: { balance: amount, __v: 1 } },
        { session }
      );

      if (senderUpdate.modifiedCount === 0) throw new Error('Insufficient balance or account not found');

      // Directly Creating transaction record
      const transaction = await createTransaction(senderId, receiverId, amount, session);

      // TODO: log to Ledger module here

      await session.commitTransaction();
      session.endSession();
      return transaction;

    } catch (error) {
      console.error('Transaction error:', error);
      await session.abortTransaction();
      session.endSession();
      attempts++;
      console.log('Transaction failed. Retrying...');
      // Don't retry for insufficient balance - it won't change
      if (error.message.includes('Insufficient balance')) {
        throw error; // Throw original error immediately
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

// Deprecated functions:

// export async function validateSufficientBalance(accountId: string, amount: number) {
//   const account = await Account.findById(accountId);
//   if (!account) throw new Error('Account not found');
//   if (Number(account.balance) < amount) throw new Error('Insufficient balance');
// }

// export async function debitAccount(accountId: string, amount: number) {
//   const res = await Account.updateOne(
//     { _id: accountId, balance: { $gte: amount } },
//     { $inc: { balance: -amount } }
//   );
//   if (res.modifiedCount === 0) throw new Error('Insufficient balance or account not found');
// }

// export async function creditAccount(accountId: string, amount: number) {
//   await Account.updateOne(
//     { _id: accountId },
//     { $inc: { balance: amount } }
//   );
// }

// export async function receiveTransaction(receiverId: string, senderId?: string, amount?: number) {
// 	if (amount && amount <= 0) throw new Error('Amount must be greater than 0');
	
// 	const receiverAccount = await Account.findById(receiverId);
// 	if (!receiverAccount) throw new Error('Receiver account not found');
	
// 	if (senderId && receiverId === senderId) throw new Error('Sender and receiver cannot be the same');
	
// 	await creditAccount(receiverId, amount || 0);

// 	log to Ledger module here
	
// 	// Create transaction record
// 	return createTransaction(senderId || '', receiverId, amount || 0);
// }
