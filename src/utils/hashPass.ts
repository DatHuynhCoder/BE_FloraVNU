import * as bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;

//hash password
export const hashPass = async (plainText: string) => {
  try {
    const hash = await bcrypt.hash(plainText, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error(error);
    throw new Error('Error hashing password');
  }
}

//compare password
export const comparePass = async (plainText: string, hashed: string) => {
  try {
    return await bcrypt.compare(plainText, hashed);
  } catch (error) {
    console.error(error);
    throw new Error('Error hashing password');
  }
}

