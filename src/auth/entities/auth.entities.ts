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

export class UserLoginType {
    @IsEmail()
    email: string;

    @IsString()
    pass_word: string;
}

export class UserSignUpType {
    @IsEmail()
    email: string;
    @IsString()
    pass_word: string;
    @IsString()
    full_name: string;
}

export class UpdateUserInfoType {
    @IsString()
    full_name: string;
    @IsInt()
    age: number;
    @IsString()
    gender: string;
    @IsString()
    country: string;
    @IsString()
    study_at: string;
    @IsString()
    working_at: string;
    @IsString()
    favorites: string;
}

export class ChangePasswordType {
    @IsString()
    old_pass_word: string;
    @IsString()
    new_pass_word: string;
}
