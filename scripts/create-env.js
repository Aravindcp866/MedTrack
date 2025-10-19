const fs = require('fs')
const path = require('path')

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourclinic.com

# WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
`

const envPath = path.join(__dirname, '../.env.local')

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists')
  console.log('Please update it with your Supabase credentials')
} else {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
  console.log('Please update it with your Supabase credentials:')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to Settings → API')
  console.log('4. Copy Project URL and Service Role Key')
  console.log('5. Update the .env.local file with your credentials')
}
