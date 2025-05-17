import { AccountAddMutation } from './AccountAddMutation';
import { AccountUpdateMutation } from './AccountUpdateMutation';
import { RegisterMutation } from './RegisterMutation';
import { LoginMutation } from './LoginMutation';
import { LogoutMutation } from './LogoutMutation';

export const accountMutation = {
    AccountAdd: AccountAddMutation,
    AccountUpdate: AccountUpdateMutation,
    Register: RegisterMutation,
    Login: LoginMutation,
    Logout: LogoutMutation,
};