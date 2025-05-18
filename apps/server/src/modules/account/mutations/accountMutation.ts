import { AccountAddMutation } from './AccountAddMutation';
import { AccountUpdateMutation } from './AccountUpdateMutation';
import { RegisterMutation } from './RegisterMutation';
import { LoginMutation } from './LoginMutation';
import { LogoutMutation } from './LogoutMutation';

export const accountMutation = {
    AccountAdd: AccountAddMutation,
    AccountUpdate: AccountUpdateMutation,
    register: RegisterMutation,
    login: LoginMutation,
    logout: LogoutMutation,
};