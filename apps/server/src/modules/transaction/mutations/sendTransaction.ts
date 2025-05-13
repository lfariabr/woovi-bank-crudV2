import { 
    validateSufficientBalance, 
    debitAccount, 
    creditAccount, 
    createTransaction 
} from "../services/TransactionService";


export async function sendTransaction(senderId: string, receiverId: string, amount: number) {
// sendTransaction mutation
await validateSufficientBalance(senderId, amount);
await debitAccount(senderId, amount);
await creditAccount(receiverId, amount);
const transaction = await createTransaction(senderId, amount);
return { transaction };