import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { AccountType } from '../accountType';
import { authService } from '../auth.service';
import { Account } from '../accountModel';
import { RegisterInputType } from '../accountType';
import { AuthPayloadType } from '../accountType';

export const RegisterMutation = {
    type: AuthPayloadType,
    args: {
        input: { type: new GraphQLNonNull(RegisterInputType) },
    },
    async resolve(_: any, { input }: { input: any }) {
        const { email, password, first_name, last_name, taxId, accountId } = input;
        
        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const account = new Account({
            email,
            password,
            first_name,
            last_name,
            taxId,
            accountId,
            balance: 1000,
            isActive: true,
        });

        await account.save();

        const token = authService.generateToken(account._id.toString());
        const accountObj = account.toObject();
        accountObj.id = accountObj._id.toString();
        
        return {
            token,
            account: accountObj
        };
    },
};