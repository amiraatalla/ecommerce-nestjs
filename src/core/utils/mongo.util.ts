import { Schema, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type ObjectId = Types.ObjectId;

/**
 * Return value as objectId if the value is a valid bson ObjectId, else return the value.
 */
export function toObjectId(value: string): string | Types.ObjectId {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value;
}

/**
 * Return the ObjectId id as a 24 byte hex string representation.
 */
export function toHexString(value: ObjectId): string {
  return value.toHexString();
}

/**
 * Hash user password using bcrypt
 */
export function toHash(value: string, rounds = 10): string {
  return value ? bcrypt.hashSync(value, rounds) : value;
}

/**
 * Checks the filter object for a valid objectID string then transforms it into ObjectID format
 * @param filter
 */
export function checkFilterForObjectId(filter: Record<string, any>) {
  const [key, value] = Object.entries(filter)[0] as [string, any];
  if (
    Types.ObjectId.isValid(value) &&
    String(new Types.ObjectId(value)) === value &&
    typeof value === 'string'
  ) {
    filter[key] = new Types.ObjectId(value);
  }

  return filter;
}

export function toPipelineStage(filter: Record<string, any>) {
  const [key, value] = Object.entries(filter)[0] as [string, any];

  if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    filter[key] = new Types.ObjectId(value);
  }

  if (typeof value !== 'string' && value[0]) {
    let valueTransformed = value;
    if (Types.ObjectId.isValid(value[0])) {
      valueTransformed = value.map((e: string) => new Types.ObjectId(e));
    }
    filter[key] = { $in: valueTransformed };
  }

  return filter;
}

export function generatePipelineStage(filter: Record<string, any>) {
  const [key, value] = Object.entries(filter)[0] as [string, any];

  switch (typeof value) {
    case 'string':
      if (Types.ObjectId.isValid(value) && String(new Types.ObjectId(value)) === value) {
        filter[key] = new Types.ObjectId(value);
      }
      break;

    default:
      console.log(value);
      if (value.length) {
        for (let e of value) {
          if (Types.ObjectId.isValid(e)) {
            e = toObjectId(e);
            console.log(e);
          }
        }
        filter[key] = { $in: value };
      }
      break;
  }

  return filter;
}

/**
 * Creates inclusion projection object with all the fields in the schema model.
 */
export function projectModelFields(schema: Schema, include?: string[]) {
  const keys = Object.keys(schema.obj);
  if (include) keys.push(...include);

  const projection: Record<string, unknown> = {};
  for (const key of keys) {
    projection[key] = 1;
  }

  return projection;
}

export function arrayToProjection(attributes: string[]): Record<string, number> {
  const specifications = {};
  for (const attr of attributes) {
    specifications[attr] = 1;
  }

  return specifications;
}

/**
 * Check if email token is still valid.
 */
export function isStillValid(createdAt: Date) {
  // valid for 1 day
  return createdAt.getTime() > new Date().getTime() - 5 * 60 * 1000;
}

/**
 * Check if the user's email is blocked from logging in to the system.
 */
export function isBlocked(dateTime: Date) {
  // Login blocked for 5 minutes since last failed login attempt more than 3 times
  return dateTime.getTime() + 5 * 60 * 1000 > new Date().getTime();
}

/**
 * Generate a resturant code by removing vowels and picking the first n of letters.
 */
export function generateCode(name: string): string {
  const constants = name.replace(/[aeiouy ]/gi, '');
  const code = constants.length > 4 ? constants : name.replace(/[ ]/gi, '');

  return code.toUpperCase().slice(0, 4);
}



export function generateMultiCode(prefix: string,startNumberToGenerate: number, endNumberToGenerate: number): string[] {
  let codes = [];
  for (let code = startNumberToGenerate; code <= endNumberToGenerate; code++) {
    let prefixCode = prefix + code;
    codes.push(prefixCode);
  }
  return codes;
}
