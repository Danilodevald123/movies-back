import { User, UserRole } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'test-uuid';
    user.username = 'test_user';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.role = UserRole.USER;
  });

  describe('Entity Properties', () => {
    it('should create a user instance', () => {
      expect(user).toBeDefined();
      expect(user.id).toBe('test-uuid');
      expect(user.username).toBe('test_user');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword');
    });

    it('should have default role as USER', () => {
      expect(UserRole.USER).toBe('user');
    });

    it('should allow ADMIN role', () => {
      user.role = UserRole.ADMIN;
      expect(user.role).toBe(UserRole.ADMIN);
    });
  });
});
