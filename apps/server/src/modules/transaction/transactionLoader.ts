import { createLoader } from '@entria/graphql-mongo-helpers';
import { registerLoader } from '../loader/loaderRegister';
import { Transaction } from './transactionModel';
// import DataLoader from 'dataloader';
// TODO

const { Wrapper, getLoader, clearCache, load, loadAll } = createLoader({
	model: Transaction,
	loaderName: 'TransactionLoader',
});

registerLoader('TransactionLoader', getLoader);

export const TransactionLoader = {
	Transaction: Wrapper,
	getLoader,
	clearCache,
	load,
	loadAll,
};
	