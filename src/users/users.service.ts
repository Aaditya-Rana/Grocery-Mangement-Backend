import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: any): Promise<UserDocument> {
        const { password, ...rest } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = new this.userModel({ ...rest, password: hashedPassword });
        return createdUser.save();
    }

    async findOne(email: string): Promise<UserDocument | undefined | null> {
        return this.userModel.findOne({ email }).exec();
    }
}
