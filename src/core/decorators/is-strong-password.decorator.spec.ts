import { StrongPassword } from './is-strong-password.decorator';

describe('StrongPassword', () => {
  let strongPassword: StrongPassword;

  beforeEach(async () => {
    strongPassword = new StrongPassword();
  });

  it('should be defined', () => {
    expect(strongPassword).toBeDefined();
  });

  it('should have a default message', () => {
    expect(strongPassword.defaultMessage()).toMatchInlineSnapshot(
      `"Password must be at least 8 characters and include one lowercase letter, one uppercase letter, one special character, and one digit."`,
    );
  });

  describe('validate', () => {
    it('valid passwords', () => {
      const password = 'P@ssw0rd';
      expect(strongPassword.validate(password)).toBe(true);
    });

    it('invalid passwords', () => {
      const cases = {
        empty: '',
        tooShort: 'P@ssw0r',
        noLetters: '!@9$1#&0',
        noNumbers: '$#tBv#&a',
        noUpperCase: 'p@ssw0rd',
        noLowerCase: 'P@SSW0RD',
        noSpecialChar: 'Passw0rd',
      };

      expect(strongPassword.validate(cases.empty)).toBe(false);
      expect(strongPassword.validate(cases.tooShort)).toBe(false);
      expect(strongPassword.validate(cases.noLetters)).toBe(false);
      expect(strongPassword.validate(cases.noNumbers)).toBe(false);
      expect(strongPassword.validate(cases.noUpperCase)).toBe(false);
      expect(strongPassword.validate(cases.noLowerCase)).toBe(false);
      expect(strongPassword.validate(cases.noSpecialChar)).toBe(false);
    });
  });
});
