const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const configContent = `const GEMINI_API_KEY = "${process.env.GEMINI_API_KEY}";`;

fs.writeFileSync('/config.js', configContent);
console.log('config.js generated successfully.');