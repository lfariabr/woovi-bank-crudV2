import { AccountType, AccountConnection } from './accountType';
import { AccountLoader } from './accountLoader';
import { connectionArgs } from 'graphql-relay';
import { Account } from './accountModel';

export const accountField = (key: string) => ({
	[key]: {
		type: AccountType,
		resolve: async (obj: Record<string, unknown>, _, context) =>
			AccountLoader.load(context, obj.account as string),
	},
});

export const allAccountsField = {
	type: AccountConnection.connectionType,
	args: {
	  ...connectionArgs,
	},
	resolve: async (_, args, context) => {
	  const { first, after } = args;
	  let cursorQuery: Record<string, any> = {};
	  if (after) {
	    const decodedId = Buffer.from(after, 'base64').toString('ascii');
	    cursorQuery._id = { $gt: decodedId };
	  }
	
	  // Fetch one extra to determine hasNextPage
	  const accounts = await Account.find(cursorQuery)
	    .sort({ _id: 1 })
	    .limit(first + 1);
	
	  const edges = accounts.slice(0, first).map(account => ({
	    node: account,
	    cursor: Buffer.from(account._id.toString()).toString('base64'),
	  }));
	
	  const hasNextPage = accounts.length > first;
	  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
	  console.log(`AllAccounts pagination: first=${first}, found=${accounts.length}, returning=${Math.min(accounts.length, first)}`);
	
	  return {
	    edges,
	    pageInfo: {
	      hasNextPage,
	      endCursor,
	    },
	  };
	},
  };

export const accountConnectionField = (key: string) => ({
	[key]: {
		type: AccountConnection.connectionType,
		args: {
			...connectionArgs,
		},
		// resolve: async (_, args, context) => {
		// 	const allAccounts = await Account.find({}).limit(2);
		// 	console.log('Available accounts:', allAccounts.map(acc => ({
		// 		id: acc.id,
		// 		accountId: acc.accountId,
		// 		taxId: acc.taxId,
		// 		first_name: acc.first_name
		// 	})));
			
		// 	const filter = context.accountId 
		// 		? { accountId: context.accountId } 
		// 		: {};
			
		// 	const accounts = await Account.find(filter)
		// 		.limit(args.first)
		// 		.skip(args.after ? parseInt(args.after) : 0);
			
		// 	if (accounts.length > 0) {
		// 		console.log('Account details:', accounts.map(acc => ({
		// 			id: acc.id,
		// 			accountId: acc.accountId,
		// 			taxId: acc.taxId,
		// 			name: acc.first_name
		// 		})));
		// 	} else if (context.accountId) {
		// 		const accIdFilter = { accountId: context.accountId };
		// 		const accountsByAccId = await Account.find(accIdFilter);
				
		// 		if (accountsByAccId.length > 0) {
		// 			return {
		// 				edges: accountsByAccId.map(account => ({
		// 					node: account,
		// 					cursor: account.id,
		// 				})),
		// 				pageInfo: {
		// 					hasNextPage: args.first && accountsByAccId.length === args.first,
		// 					endCursor: accountsByAccId.length > 0 ? accountsByAccId[accountsByAccId.length - 1].id : null,
		// 				},
		// 			};
		// 		}
		// 	}
			
		// 	return {
		// 		edges: accounts.map(account => ({
		// 			node: account,
		// 			cursor: account.id,
		// 		})),
		// 		pageInfo: {
		// 			hasNextPage: args.first && accounts.length === args.first,
		// 			endCursor: accounts.length > 0 ? accounts[accounts.length - 1].id : null,
		// 		},
		// 	};
		// },
		resolve: async (_, args, context) => {
			const { first, after } = args;
			let cursorQuery: Record<string, any> = {};
			if (after) {
			  const decodedId = Buffer.from(after, 'base64').toString('ascii');
			  cursorQuery._id = { $gt: decodedId };
			}
		  
			// Fetch one extra to determine hasNextPage
			const accounts = await Account.find(cursorQuery)
			  .sort({ _id: 1 })
			  .limit(first + 1);
		  
			const edges = accounts.slice(0, first).map(account => ({
			  node: account,
			  cursor: Buffer.from(account._id.toString()).toString('base64'),
			}));
		  
			const hasNextPage = accounts.length > first;
			const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
			console.log(`Accounts pagination: first=${first}, found=${accounts.length}, returning=${Math.min(accounts.length, first)}`);
		  
			return {
			  edges,
			  pageInfo: {
				hasNextPage,
				endCursor,
			  },
			};
		  }
		},
	});
