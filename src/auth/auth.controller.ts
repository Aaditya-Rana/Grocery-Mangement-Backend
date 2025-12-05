import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        const { password, ...result } = user.toObject();
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
