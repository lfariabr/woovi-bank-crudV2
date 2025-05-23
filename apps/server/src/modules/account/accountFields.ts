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

export const accountConnectionField = (key: string) => ({
	[key]: {
		type: AccountConnection.connectionType,
		args: {
			...connectionArgs,
		},
		resolve: async (_, args, context) => {
			// Add detailed logging
			console.log('==== ACCOUNT FILTERING DEBUG ====');
			console.log('context.accountId:', context.accountId);
			console.log('typeof context.accountId:', typeof context.accountId);
			
			// First try to find accounts to see what's available
			const allAccounts = await Account.find({}).limit(10);
			console.log('Available accounts:', allAccounts.map(acc => ({
				id: acc.id,
				accountId: acc.accountId,
				taxId: acc.taxId,
				first_name: acc.first_name
			})));
			
			// Try with taxId as fallback - this may be what's in the context
			const filter = context.accountId 
				? { accountId: context.accountId } 
				: {};
			
			console.log('Using filter:', filter);
			
			const accounts = await Account.find(filter)
				.limit(args.first)
				.skip(args.after ? parseInt(args.after) : 0);
			
			console.log('Accounts found with filter:', accounts.length);
			
			if (accounts.length > 0) {
				console.log('Account details:', accounts.map(acc => ({
					id: acc.id,
					accountId: acc.accountId,
					taxId: acc.taxId,
					name: acc.first_name
				})));
			} else if (context.accountId) {
				// Try with actual accountId as a secondary fallback
				console.log('Trying accountId filter instead');
				const accIdFilter = { accountId: context.accountId };
				const accountsByAccId = await Account.find(accIdFilter);
				
				if (accountsByAccId.length > 0) {
					console.log('Found accounts with accountId filter');
					return {
						edges: accountsByAccId.map(account => ({
							node: account,
							cursor: account.id,
						})),
						pageInfo: {
							hasNextPage: args.first && accountsByAccId.length === args.first,
							endCursor: accountsByAccId.length > 0 ? accountsByAccId[accountsByAccId.length - 1].id : null,
						},
					};
				}
			}
			
			return {
				edges: accounts.map(account => ({
					node: account,
					cursor: account.id,
				})),
				pageInfo: {
					hasNextPage: args.first && accounts.length === args.first,
					endCursor: accounts.length > 0 ? accounts[accounts.length - 1].id : null,
				},
			};
		},
	},
});
