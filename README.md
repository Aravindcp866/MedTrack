# 🏥 ClinicSync System

A comprehensive ClinicSync application built with Next.js 14, Supabase, and modern web technologies.

## ✨ Features

### 📊 **Dashboard**
- Real-time analytics and metrics
- Revenue and expense tracking
- Patient statistics
- Low stock alerts

### 👥 **Patient Management**
- Complete patient profiles
- Medical history tracking
- Emergency contact information
- Patient search by phone number or name

### 📦 **Inventory Management**
- Product catalog with quantities
- Stock level monitoring
- Low stock alerts
- Real-time stock updates

### 🏥 **Visit Management**
- Patient visit tracking
- Visit types and status
- Treatment notes
- Follow-up scheduling

### 💰 **Billing & Revenue**
- Invoice generation
- Payment tracking
- Revenue analytics
- Expense categorization

### 📈 **Analytics & Reports**
- Monthly revenue vs expenses (Line Chart)
- Expenses by category (Bar Chart)
- Revenue trends
- Financial insights

### ⚙️ **Settings**
- Currency settings (INR, USD, EUR)
- Profile management
- System configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase-schema-working.sql`
   - Create a storage bucket named "invoices"

5. **Add Sample Data**
   ```bash
   node scripts/add-comprehensive-dummy-data.js
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Open Application**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Icons**: Lucide React

## 📱 Features Overview

### **Patient Management**
- Add, edit, and delete patients
- Complete medical profiles
- Search by phone number or name
- Medical history tracking

### **Inventory Management**
- Product catalog with stock quantities
- Real-time stock updates
- Low stock monitoring
- Category-based organization

### **Billing System**
- Invoice generation
- Payment status tracking
- Patient search integration
- PDF download capability

### **Analytics Dashboard**
- Revenue vs expenses visualization
- Category-wise expense breakdown
- Monthly trends
- Financial insights

### **Settings & Configuration**
- Multi-currency support (INR, USD, EUR)
- Profile management
- System preferences

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── layout/          # Layout components
│   └── auth/            # Authentication components
├── lib/                 # Utilities and configurations
│   ├── api/            # API functions
│   └── types.ts        # TypeScript types
└── contexts/           # React contexts
```

### Key Files
- `supabase-schema-working.sql` - Database schema
- `scripts/add-comprehensive-dummy-data.js` - Sample data script
- `.env.local` - Environment variables

## 🎯 Usage

### **Adding Patients**
1. Go to Patients page
2. Click "Add Patient"
3. Fill in patient details
4. Save patient information

### **Managing Inventory**
1. Go to Inventory page
2. View product quantities
3. Click edit icon to update stock
4. Monitor low stock alerts

### **Creating Bills**
1. Go to Billing page
2. Click "New Bill"
3. Search for patient by phone/name
4. Generate invoice

### **Viewing Analytics**
1. Go to Revenue page
2. View monthly revenue vs expenses (line chart)
3. Check expenses by category (bar chart)
4. Review financial insights

## 🔒 Security

- Row Level Security (RLS) enabled
- Secure API endpoints
- Input validation
- Error handling

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for modern healthcare management**