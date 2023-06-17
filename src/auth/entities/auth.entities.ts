import { type } from 'os';

type UserLoginType = {
    email: string;
    pass_word: string;
};

type UserSignUpType = {
    email: string;
    pass_word: string;
    full_name: string;
};

type UpdateUserInfoType = {
    full_name: string;
    age: number;
    avatar: string;
    gender: string;
    country: string;
};

type ChangePasswordType = {
    old_pass_word: string;
    new_pass_word: string;
};

export {
    UserLoginType,
    UserSignUpType,
    UpdateUserInfoType,
    ChangePasswordType,
};
