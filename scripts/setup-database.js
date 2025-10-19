const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up ClinicSync Database...')

// Check if .env exists
const envPath = path.join(__dirname, '../.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!')
  console.log('Please create a .env file with your Supabase credentials.')
  console.log('See DATABASE_SETUP_GUIDE.md for instructions.')
  process.exit(1)
}

console.log('✅ .env file found')

// Install dotenv if not already installed
try {
  console.log('📦 Installing dotenv...')
  execSync('npm install dotenv', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  console.log('✅ dotenv installed')
} catch (error) {
  console.log('⚠️  dotenv might already be installed')
}

// Run the schema application script
try {
  console.log('🔄 Applying database schema...')
  execSync('node scripts/apply-schema.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  console.log('✅ Database schema applied successfully!')
} catch (error) {
  console.error('❌ Failed to apply database schema:', error.message)
  process.exit(1)
}

// Test the connection
try {
  console.log('🧪 Testing database connection...')
  execSync('node scripts/test-connection.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  console.log('✅ Database connection test passed!')
} catch (error) {
  console.error('❌ Database connection test failed:', error.message)
  console.log('Please check your Supabase credentials and try again.')
  process.exit(1)
}

console.log('🎉 Database setup complete!')
console.log('You can now start the application with: npm run dev')
console.log('No storage bucket needed - the app generates PDFs directly without storing files.')
