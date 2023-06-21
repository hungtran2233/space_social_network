import {
    validate,
    validateOrReject,
    Contains,
    IsInt,
    IsString,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
} from 'class-validator';

class UserLoginType {
    @IsEmail()
    email: string;

    @IsString()
    pass_word: string;
}

class UserSignUpType {
    @IsEmail()
    email: string;

    @IsString()
    pass_word: string;

    @IsString()
    full_name: string;
}

class UpdateUserInfoType {
    @IsString()
    full_name: string;

    @IsInt()
    age: number;

    @IsString()
    avatar: string;
    @IsString()
    gender: string;
    @IsString()
    country: string;
}

class ChangePasswordType {
    @IsString()
    old_pass_word: string;
    @IsString()
    new_pass_word: string;
}

export {
    UserLoginType,
    UserSignUpType,
    UpdateUserInfoType,
    ChangePasswordType,
};
