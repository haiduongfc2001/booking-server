import bcrypt from 'bcrypt';

const securePassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err: any) {
    console.log(err.message);
    throw new Error("Password hashing failed");
  }
};

export default securePassword;
