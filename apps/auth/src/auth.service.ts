import {ConflictException, Inject, Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS, KafkaService} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";
import {DatabaseService, users} from "@app/database";
import {JwtService} from "@nestjs/jwt";
import {eq} from "drizzle-orm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
 constructor(
     @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
     private readonly dbService: DatabaseService,
     private readonly jwtService: JwtService,
 ) {
 }

 async onModuleInit() {
  try {
   await this.kafkaClient.connect();
  } catch (error) {
   console.error('Failed to connect to Kafka in AuthService:', error.message);
  }
 }

 async register(email: string, password: string, name: string){

  //check if user exists
  const existingUser = await this.dbService.db.
  select().from(users)
      .where(eq(users.email, email))
      .limit(1);

  if(existingUser.length > 0) {
   throw new ConflictException('User already exists')
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create user
  const [ user] = await this.dbService.db
      .insert(users)
      .values({ email, password: hashedPassword, name})
      .returning();

  //Send an event when a user is registered
  this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
   userId: user.id,
   email: user.email,
   name: user.name,
   timestamp: new Date().toISOString()
  });

  return { message: 'User registered successfully', userId: user.id}
 }

 async login(email: string, password: string){
  const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

  if (!user || !(await bcrypt.compare(password, user.password))){
   throw new UnauthorizedException('The credentials are invalid')
  }

  const token = this.jwtService.sign({ sub: user.id, email: user.email});

  this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
   userId: user.id,
   timestamp: new Date().toISOString(),
  });

  return {
   access_token: token,
   user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
   }
  }
 }

 async getProfile(userId: string) {
  const [user] = await this.dbService.db
      .select({
       id: users.id,
       email: users.email,
       name: users.name,
       role: users.role
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

  if (!user) {
   throw new UnauthorizedException('User not found')
  }

  return user;
 }
}
