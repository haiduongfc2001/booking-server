import bcrypt from 'bcrypt';

const securePassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 16);
  } catch (err: any) {
    console.log(err.message);
    throw new Error("Password hashing failed");
  }
};

export default securePassword;
