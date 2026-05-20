import bcrypt from "bcrypt";

async function hashPassword(string) {
  const hashedPassword = await bcrypt.hashSync(string, 12);
  return hashedPassword;
}

// const password = await hashPassword("test001");
// console.log(password);

console.log(
  await bcrypt.compare(
    "test001",
    "$2b$12$YKSf2TBH.7swkh8GydxHHe0/vBClEtOmI5c7AeqBfIY1mEf020WVq",
  ),
);
