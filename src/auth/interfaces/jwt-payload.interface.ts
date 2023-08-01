/**
 * JWT creation or decoded payload
 */
export interface JwtPayload {
  /**
   * User id in database.
   */
  id: string;

  /**
   * Issued at date. Automatically generated on token creation.
   */
  iat?: number;

  /**
   * Expire at date. Automatically generated on token creation.
   */
  exp?: number;

  /**
   * Refresh token version.
   */
  version?: number;
}
