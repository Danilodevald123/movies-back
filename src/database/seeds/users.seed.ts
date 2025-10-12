import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';

export const usersSeed = [
  {
    username: 'admin',
    email: 'admin@conexa.com',
    password: 'Admin123!',
    role: UserRole.ADMIN,
  },
  {
    username: 'user',
    email: 'user@conexa.com',
    password: 'User123!',
    role: UserRole.USER,
  },
];

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Los usuarios ya fueron seeded');
    return;
  }

  for (const userData of usersSeed) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log(`\n${usersSeed.length} usuarios insertados exitosamente`);
  console.log('\n📝 Credenciales de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Usuario Admin:');
  console.log('   Email: admin@conexa.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('👤 Usuario Regular:');
  console.log('   Email: user@conexa.com');
  console.log('   Password: User123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
