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
