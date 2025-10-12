import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new RegisterDto();
    dto.username = 'test_user';
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is not a valid email', async () => {
    const dto = new RegisterDto();
    dto.username = 'test_user';
    dto.email = 'not-an-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty('isEmail');
  });

  it('should fail if password is too short', async () => {
    const dto = new RegisterDto();
    dto.username = 'test_user';
    dto.email = 'test@example.com';
    dto.password = '12345';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty('minLength');
  });

  it('should fail if username is missing', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const usernameError = errors.find((e) => e.property === 'username');
    expect(usernameError).toBeDefined();
  });

  it('should fail if username is too short', async () => {
    const dto = new RegisterDto();
    dto.username = 'ab';
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const usernameError = errors.find((e) => e.property === 'username');
    expect(usernameError).toBeDefined();
  });

  it('should fail if username has invalid characters', async () => {
    const dto = new RegisterDto();
    dto.username = 'test user!';
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const usernameError = errors.find((e) => e.property === 'username');
    expect(usernameError).toBeDefined();
    expect(usernameError?.constraints).toHaveProperty('matches');
  });

  it('should fail if email is missing', async () => {
    const dto = new RegisterDto();
    dto.username = 'test_user';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail if password is missing', async () => {
    const dto = new RegisterDto();
    dto.username = 'test_user';
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
  });
});
