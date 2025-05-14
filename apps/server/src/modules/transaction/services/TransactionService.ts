import { Account } from "../../account/accountModel";
import { Transaction } from "../../transaction/transactionModel";
import mongoose from "mongoose";

/**
 * Validate that an account exists and has sufficient balance.
 */
export async function validateSufficientBalance(accountId: string, amount: number) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');
  if (Number(account.balance) < amount) throw new Error('Insufficient balance');
}

/**
 * Atomically debit an account.
 */
export async function debitAccount(accountId: string, amount: number) {
  const res = await Account.updateOne(
    { _id: accountId, balance: { $gte: amount } },
    { $inc: { balance: -amount } }
  );
  if (res.modifiedCount === 0) throw new Error('Insufficient balance or account not found');
}

/**
 * Credit an account.
 */
export async function creditAccount(accountId: string, amount: number) {
  await Account.updateOne(
    { _id: accountId },
    { $inc: { balance: amount } }
  );
}

/**
 * Create a transaction record.
 */
export async function createTransaction(senderId: string, receiverId: string, amount: number) {
	return Transaction.create({
		account_id_sender: senderId,
		account_id_receiver: receiverId,
		amount: mongoose.Types.Decimal128.fromString(amount.toString())
	});
}

/**
 * Full send-transaction workflow (validation, atomic update, record).
 */
export async function sendTransaction(senderId: string, receiverId: string, amount: number) {
  if (senderId === receiverId) throw new Error('Sender and receiver cannot be the same');
  if (amount <= 0) throw new Error('Amount must be greater than 0');

  await validateSufficientBalance(senderId, amount);

  // Atomic debit
  await debitAccount(senderId, amount);
  // Credit receiver
  await creditAccount(receiverId, amount);

  // Create transaction record
  return createTransaction(senderId, receiverId, amount);
}

/**
 * Full receive-transaction workflow (validation, atomic update, record).
 */
export async function receiveTransaction(receiverId: string, senderId?: string, amount?: number) {
	if (amount && amount <= 0) throw new Error('Amount must be greater than 0');
	
	const receiverAccount = await Account.findById(receiverId);
	if (!receiverAccount) throw new Error('Receiver account not found');
	
	if (senderId && receiverId === senderId) throw new Error('Sender and receiver cannot be the same');
	
	await creditAccount(receiverId, amount || 0);

	// TODO: log to Ledger module here
	
	// Create transaction record
	return createTransaction(senderId || '', receiverId, amount || 0);
}
  