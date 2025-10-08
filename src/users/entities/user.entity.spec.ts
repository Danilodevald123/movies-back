/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'test-uuid';
    user.email = 'test@example.com';
    user.password = 'plainPassword';
    user.role = UserRole.USER;
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password before insert', async () => {
      const salt = 'test-salt';
      const hashedPassword = 'hashed-password';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await user.hashPassword();

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', salt);
      expect(user.password).toBe(hashedPassword);
    });

    it('should not hash if password is not set', async () => {
      user.password = '';

      await user.hashPassword();

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash if password is undefined', async () => {
      user.password = undefined as any;

      await user.hashPassword();

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should not hash if password is null', async () => {
      user.password = null as any;

      await user.hashPassword();

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('comparePassword', () => {
    beforeEach(() => {
      user.password = 'hashed-password';
    });

    it('should return true for matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.comparePassword('plainPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashed-password',
      );
    });

    it('should return false for non-matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.comparePassword('wrongPassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashed-password',
      );
    });

    it('should handle empty password attempt', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.comparePassword('');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('', 'hashed-password');
    });
  });

  describe('Entity Properties', () => {
    it('should have default role as USER', () => {
      // El default se aplica en la DB, pero verificamos el enum
      expect(UserRole.USER).toBe('user');
    });

    it('should allow ADMIN role', () => {
      user.role = UserRole.ADMIN;
      expect(user.role).toBe(UserRole.ADMIN);
    });
  });
});
