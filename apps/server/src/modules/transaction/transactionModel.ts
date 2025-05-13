import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';
import { Account } from '../account/accountModel';

const Schema = new mongoose.Schema<ITransaction>(
    {
        ID: {
            type: String,
            description: 'The id of the transaction',
            unique: true,
        },
        account_id_sender: {
            type: mongoose.Schema.Types.ObjectId,
            description: 'The account id of the sender of the transaction',
            ref: Account,
        },
        account_id_receiver: {
            type: mongoose.Schema.Types.ObjectId,
            description: 'The account id of the receiver of the transaction',
            ref: Account,
        },
        amount: {
            type: mongoose.Schema.Types.Decimal128,
            description: 'The amount of the transaction',
        },
        createdAt: {
            type: Date,
            description: 'The creation date of the transaction',
        },
    },
    {
        collection: 'Transaction',
        timestamps: true,
    }
);

export type ITransaction = {
    ID: string;
    account_id_sender: mongoose.Types.ObjectId;
    account_id_receiver: mongoose.Types.ObjectId;
    amount: mongoose.Schema.Types.Decimal128;
    createdAt: Date;
} & Document;

export const Transaction: Model<ITransaction> = mongoose.model('Transaction', Schema);
