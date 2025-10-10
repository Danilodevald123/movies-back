import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  create(userData: Partial<User>): User {
    return this.ormRepository.create(userData);
  }

  async save(user: User): Promise<User> {
    return await this.ormRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.ormRepository.find();
  }

  async findById(id: string): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { email } });
  }
}
