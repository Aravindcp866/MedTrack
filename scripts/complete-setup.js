const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function completeSetup() {
  console.log('🚀 ClinicSync Complete Setup')
  console.log('============================\n')

  // Step 1: Check if .env exists
  const envPath = path.join(__dirname, '../.env')
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...')
    
    const supabaseUrl = await question('Enter your Supabase Project URL: ')
    const serviceKey = await question('Enter your Supabase Service Role Key: ')
    const jwtSecret = await question('Enter a JWT Secret (or press Enter for default): ') || 'your-secret-key-change-this'
    
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# JWT Secret (for authentication)
JWT_SECRET=${jwtSecret}

# Email Configuration (optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourclinic.com

# WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
`
    
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env file created successfully!\n')
  } else {
    console.log('✅ .env file already exists\n')
  }

  // Step 2: Install dependencies
  console.log('📦 Installing dependencies...')
  try {
    execSync('npm install dotenv', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log('✅ Dependencies installed\n')
  } catch (error) {
    console.log('⚠️  Dependencies might already be installed\n')
  }

  // Step 3: Apply database schema
  console.log('🔄 Applying database schema...')
  try {
    execSync('node scripts/apply-schema.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log('✅ Database schema applied successfully!\n')
  } catch (error) {
    console.error('❌ Failed to apply database schema:', error.message)
    console.log('Please check your Supabase credentials and try again.\n')
    return
  }

  // Step 4: Test connection
  console.log('🧪 Testing database connection...')
  try {
    execSync('node scripts/test-connection.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log('✅ Database connection test passed!\n')
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    console.log('Please check your Supabase credentials and try again.\n')
    return
  }

  console.log('🎉 Setup Complete!')
  console.log('==================')
  console.log('Your ClinicSync application is ready to use!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Run: npm run dev')
  console.log('2. Open: http://localhost:3000')
  console.log('3. Login with: admin@clinic.com / admin123')
  console.log('')
  console.log('The dashboard will now show real data from your database!')

  rl.close()
}

// Run the setup
completeSetup().catch(console.error)
