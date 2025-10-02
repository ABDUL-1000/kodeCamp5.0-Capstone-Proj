import bcrypt from 'bcryptjs';

const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 12);
console.log('Hashed password for "admin123":', hashedPassword);