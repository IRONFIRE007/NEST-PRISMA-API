import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')  //auth/
export class AuthContoller {
  constructor(private authService: AuthService) {}

  
@Post('signup')  //auth/signup
  signup(@Body() dto:AuthDto) {
    console.log(
      dto
    );
    return this.authService.signup(dto);
  }

@HttpCode(HttpStatus.OK)
@Post('signin')   //auth/signin
  signin(@Body() dto:AuthDto) {
    console.log(
      dto
    );
      return this.authService.signin(dto);
  }
}
