const bcrypt = require('bcryptjs');

const password = 'admin123'; // Change this to your desired password
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Admin User Setup ===\n');
console.log('Run this SQL in your Supabase SQL Editor:\n');
console.log('-- Delete existing user if any');
console.log("DELETE FROM admin_users WHERE username = 'mgarcia4';\n");
console.log('-- Insert admin user with hashed password');
console.log("INSERT INTO admin_users (username, password_hash, email, is_active)");
console.log("VALUES (");
console.log("  'mgarcia4',");
console.log(`  '${hash}',`);
console.log("  'mgarcia4@gmail.com',");
console.log("  true");
console.log(");\n");
console.log('Login credentials:');
console.log(`  Username: mgarcia4`);
console.log(`  Password: ${password}`);
console.log('\n');
