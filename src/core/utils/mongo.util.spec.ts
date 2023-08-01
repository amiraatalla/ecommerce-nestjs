import { compare } from 'bcryptjs';
import { generateResturantCode, toHash } from '../utils/mongo.util';

describe('mongo.util', () => {
  describe('toHash', () => {
    it('should hash a password string', async () => {
      const password = 'P@ssw0rd';
      const hash = toHash(password);
      const isValid = await compare(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('generateResturantCode', () => {
    it('should generate a 3 constant letter code from the provided name', () => {
      const name = 'La Serre';
      const code = generateResturantCode(name);

      expect(code).toEqual('LSR');
    });
    it('should generate a 3 constant or vowel letter code from the provided name', () => {
      const name = 'La Ara';
      const code = generateResturantCode(name);

      expect(code).toEqual('LAA');
    });
  });
});
