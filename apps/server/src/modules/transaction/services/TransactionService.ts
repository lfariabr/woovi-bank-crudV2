import { Account } from "../../account/accountModel";
import { Transaction } from "../../transaction/transactionModel";

export async function validateSufficientBalance(accountId: string, amount: number) {
	const account = await Account.findOne({ _id: accountId });
	if (!account) {
		throw new Error('Account not found');
	}
	if (account.balance < amount) {
		throw new Error('Insufficient balance');
	}
}

export async function debitAccount(accountId: string, amount: number) {
	const res = await Account.updateOne({
        { _id: accountId, balance: { $gte: amount } },
        { $inc: { balance: -amount } }
    })
    if (res.nModified === 0) {
        throw new Error('Insufficient balance or account not found');
    }
}

export async function creditAccount(accountId: string, amount: number) {
	await Account.updateOne({
		_id: accountId,
	}, {
		$inc: { balance: amount }
	})
}

export async function createTransaction(accountId: string, amount: number) {
	return await Transaction.create({
		account_id_sender: accountId,
        account_id_receiver: accountId,
		amount,
        type
	})
}
