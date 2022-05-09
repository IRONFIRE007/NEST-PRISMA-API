import { ForbiddenException, Injectable } from "@nestjs/common";
import { User,Bookmark } from '@prisma/client'
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{

constructor(private prismaService : PrismaService, private jwt : JwtService, private config : ConfigService ){}

async signup(dto: AuthDto){
    

    //Generate Password 
  const  hash = await argon.hash(dto.password);
    //Save new User

try {
    
    const user = await this.prismaService.user.create
({data:{ email: dto.email, hash: hash}, 
    // select:{ id:true,email:true,createdAt:true}
 });
 
  delete user.hash;
     //Return User Save
     return  this.signToken(user.id, user.email);
} catch (error) {
    if(error instanceof PrismaClientKnownRequestError){
        if(error.code === 'P2002')  {
            throw new ForbiddenException('Credential taken')
        }
    }
    throw error;
}
}

async signin(dto: AuthDto){

  //Find the user by email
  const user = await this.prismaService.user.findUnique({
  where :{email:dto.email},
  });
  
   //If user does not exist throw Exception
  
   if(!user) throw new ForbiddenException('Credentials incorrect');

    //Compare Password 

    const  pwMactches = await  argon.verify(user.hash,dto.password)
   
    // If password is incorrect throw Exception

    if(!pwMactches) throw new ForbiddenException('Crendential incorrect');

    //Send back the User
    // delete user.hash;

    return  this.signToken(user.id, user.email);
}


async signToken(userId : number, email:string) : Promise<{acces_token:string}> {
 
const payload= {sub : userId, email};
const secret = this.config.get('JWT_SECRET');

const token = await  this.jwt.signAsync(payload,{expiresIn:'59m',secret:secret});


return {acces_token:token};
}

}