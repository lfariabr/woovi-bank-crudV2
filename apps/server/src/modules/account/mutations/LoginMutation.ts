import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { authService } from '../auth.service';
import { AuthPayloadType, LoginInputType } from '../accountType'; // Import the types

export const LoginMutation = {
    type: AuthPayloadType,
    args: {
        input: { type: new GraphQLNonNull(LoginInputType) },
    },
    async resolve(_: any, { input }: { input: { email: string; password: string } }) {
        const account = await authService.validateCredentials(input.email, input.password);
        if (!account) {
            throw new Error('Invalid credentials');
        }

        const token = authService.generateToken(account._id.toString());
        return {
            account: account.toObject(),
            token,
        };
    },
};