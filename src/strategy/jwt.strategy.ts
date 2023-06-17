import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // nguồn lấy token từ client
            ignoreExpiration: false,
            secretOrKey: config.get('SECRET_KEY'), // NODE32
        });
    }

    // giải mã và trả về dữ liệu khi token hợp lệ cho controller (API)  => lấy từ req.user
    async validate(tokenDecode: any) {
        return tokenDecode;
    }
}
