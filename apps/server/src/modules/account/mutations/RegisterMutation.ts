import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { AccountType } from '../accountType';
import { authService } from '../auth.service';
import { Account } from '../accountModel';

const RegisterInputType = new GraphQLInputObjectType({
    name: 'RegisterInput',
    fields: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      first_name: { type: GraphQLString },
      last_name: { type: GraphQLString },
      taxId: { type: GraphQLString },
      accountId: { type: GraphQLString },
    },
  });

export const RegisterMutation = {
    type: AccountType,
    args: {
        input: { type: new GraphQLNonNull(RegisterInputType) },
    },
    resolve: async(_: any, { input }: {
        input: {
            email: string;
            password: string;
            first_name?: string;
            last_name?: string;
            taxId?: string;
            accountId?: string;
        }
    }) => {
        const { email, password, ...rest } = input;
        const existing = await Account.findOne({ email });
        if (existing) {
            throw new Error('Email already in use... Sorry!');
        }

        const hashedPassword = await authService.hashPassword(password);
        const account = new Account({
            email,
            password: hashedPassword,
            ...rest,
        });

        await account.save();
        return account;
    },
}