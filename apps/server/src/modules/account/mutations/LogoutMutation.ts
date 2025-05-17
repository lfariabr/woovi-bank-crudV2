import { GraphQLNonNull, GraphQLString } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { authService } from '../auth.service';

export const LogoutMutation = mutationWithClientMutationId({
    name: 'Logout',
    inputFields: {
        token: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        success: { type: GraphQLString,
                resolve: ({ success }) => success
        },
    },
    mutateAndGetPayload: async ({ token }) => {
        await authService.invalidateToken(token);
        return { success: true };
    },
});