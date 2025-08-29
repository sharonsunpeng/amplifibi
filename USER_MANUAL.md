# AmplifiBI User Manual
*Smart Business Finance SaaS for New Zealand & Australian Businesses*

---

## 🚀 Quick Start with Demo Accounts

**New to AmplifiBI?** Explore all features using our pre-loaded demo accounts:

### 🆓 **FREE Tier Demo**
- **Email**: `demo.free@amplifibi.com`
- **Password**: `Demo123!`
- **Business**: Sarah Johnson's Business
- **Features**: Full accounting system with some premium features restricted

### 💎 **PREMIUM Tier Demo**
- **Email**: `demo.premium@amplifibi.com`
- **Password**: `Demo123!` 
- **Business**: Michael Chen's Business
- **Features**: Complete access to all advanced features

**Both accounts have identical financial data** - perfect for comparing FREE vs PREMIUM functionality!

---

## 📋 Feature Comparison: FREE vs PREMIUM

| Feature | FREE | PREMIUM |
|---------|------|---------|
| **Core Accounting** | ✅ Full Access | ✅ Full Access |
| Customer Management | ✅ Unlimited | ✅ Unlimited |
| Invoice Management | ✅ All Features | ✅ All Features |
| Chart of Accounts | ✅ Complete | ✅ Complete |
| Double-Entry Bookkeeping | ✅ Yes | ✅ Yes |
| Transaction Recording | ✅ Unlimited | ✅ Unlimited |
| GST Management | ✅ All Options | ✅ All Options |
| Basic Financial Reports | ✅ Yes | ✅ Yes |
| **Premium Features** | ❌ Restricted | ✅ Full Access |
| Business Health Score Dashboard | ❌ "Pro" Badge | ✅ Complete Analysis |
| Advanced Tax Filing & Compliance | ❌ "Pro" Badge | ✅ Full GST Management |
| AI-Powered Business Insights | ❌ "Pro" Badge | ✅ Claude AI Integration |
| Advanced Analytics & Forecasting | ❌ "Pro" Badge | ✅ Predictive Analytics |
| Bank Integration (Akahu API) | ❌ "Pro" Badge | ✅ Live Bank Feeds |
| Priority Support | ❌ Community | ✅ Priority Support |

---

# 📖 Complete User Guide

## 🔐 Getting Started

### 1. Account Registration
1. Visit your AmplifiBI instance (localhost:3000)
2. Click **"Sign Up"** 
3. Fill in:
   - **Name**: Your full name
   - **Email**: Business email address
   - **Password**: Strong password (8+ characters)
4. Click **"Create Account"**
5. You'll start with a **FREE** account and can upgrade anytime

### 2. Initial Setup
After registration, AmplifiBI automatically:
- ✅ Creates your chart of accounts (NZ standard)
- ✅ Sets up default transaction categories
- ✅ Configures GST settings (can be modified)
- ✅ Prepares your dashboard

---

## 👥 Customer Management

### Adding New Customers
1. **Navigate**: Dashboard → Customers
2. **Click**: "Add Customer" button
3. **Fill Required Info**:
   - Customer Name
   - Email (optional but recommended)
   - Phone number
4. **Business Details**:
   - Company Name
   - GST/Tax Number (if GST registered)
   - Payment Terms (default 30 days)
5. **Address Information** (optional):
   - Street Address, City, State/Province
   - Postal Code, Country
6. **Save** customer

### Managing Existing Customers
- **View All**: Customer list with search functionality
- **Edit**: Click customer name → Edit details
- **Delete**: Use delete button (only if no invoices)
- **View Invoices**: See all invoices for specific customer

---

## 🧾 Invoice Management

### Creating Professional Invoices

#### Step 1: Basic Invoice Setup
1. **Navigate**: Dashboard → Invoices → "Create Invoice"
2. **Select Customer**: Choose from dropdown
3. **Set Dates**:
   - Issue Date (defaults to today)
   - Due Date (auto-calculated from customer payment terms)

#### Step 2: Configure GST Settings
**Choose GST treatment** (New Zealand specific):

##### **GST-Inclusive Pricing** (Default)
- ✅ Check "GST Inclusive Pricing"
- Prices you enter **include** 15% GST
- **Example**: Enter $115 → Customer pays $115 (includes $15 GST)
- **Best for**: B2C businesses, retail

##### **GST-Exclusive Pricing**
- ❌ Uncheck "GST Inclusive Pricing"  
- Prices you enter are **before** GST
- **Example**: Enter $100 → Customer pays $115 ($100 + $15 GST)
- **Best for**: B2B businesses, professional services

##### **GST-Exempt Transactions**
- ✅ Check "GST Exempt Transaction"
- No GST charged at all
- **Best for**: 
  - Selling to non-GST registered businesses
  - Exempt supplies (financial services, rent, etc.)
  - International sales

#### Step 3: Add Invoice Items
1. **Item Description**: What you're selling
2. **Quantity**: Number of units
3. **Unit Price**: Price per unit
   - **If GST Inclusive**: Enter final price customer sees
   - **If GST Exclusive**: Enter price before GST
4. **Add More Items**: Click "Add Item" for multiple lines

#### Step 4: Review & Send
- **Check totals** in Invoice Summary panel
- **Add notes** (optional)
- **Save as Draft** OR **Create & Send Invoice**

### Invoice Status Workflow
```
DRAFT → SENT → VIEWED → PAID
   ↓      ↓       ↓       ↓
 Edit   Track   Follow   Record
 Mode  Delivery   Up    Payment
```

### Recording Payments
1. **Find Invoice**: Dashboard → Invoices
2. **Click Invoice**: View invoice details
3. **Record Payment**: Use "Record Payment" button
4. **Enter Amount**: Full or partial payment
5. **Payment Date**: When payment was received
6. **Save**: Updates invoice status automatically

---

## 🏦 Chart of Accounts

### Understanding Account Types

#### **Assets** (What you own)
- **1000**: Business Bank Account
- **1200**: Accounts Receivable (money owed to you)
- **1500**: Office Equipment
- **1520**: Computer Equipment

#### **Liabilities** (What you owe)
- **2000**: Accounts Payable (bills you need to pay)
- **2100**: Credit Card
- **2200**: GST Payable (GST you owe to IRD)

#### **Equity** (Your ownership)
- **3000**: Owner Equity
- **3200**: Retained Earnings

#### **Revenue** (Money coming in)
- **4000**: Consulting Revenue
- **4100**: Product Sales

#### **Expenses** (Money going out)
- **5000**: Office Rent
- **5100**: Utilities
- **5200**: Marketing
- **5300**: Professional Services

### Adding Custom Accounts
1. **Navigate**: Dashboard → Accounts
2. **Click**: "Add Account"
3. **Choose Account Type**: Asset/Liability/Equity/Revenue/Expense
4. **Enter Details**:
   - Account Name
   - Account Code (optional)
   - Description
5. **Save**: Account becomes available for transactions

---

## 💰 Recording Transactions

### Quick Transaction (Dashboard)
1. **Dashboard**: Click "Add Transaction" button
2. **Fill Form**:
   - **Description**: What the transaction is for
   - **Amount**: Transaction value
   - **Date**: When it occurred
   - **Debit Account**: Where money is going TO
   - **Credit Account**: Where money is coming FROM
3. **Save**: Creates double-entry transaction

### Advanced Transaction Entry
1. **Navigate**: Dashboard → Transactions
2. **Click**: "Add Transaction"
3. **Double-Entry Logic**:
   - **Debit**: Increases Assets/Expenses, Decreases Liabilities/Equity/Revenue
   - **Credit**: Increases Liabilities/Equity/Revenue, Decreases Assets/Expenses

#### **Common Transaction Examples**:

##### **Receiving Payment from Customer**
- **Debit**: Business Bank Account (+$1,000)
- **Credit**: Accounts Receivable (-$1,000)

##### **Paying Office Rent**
- **Debit**: Office Rent Expense (+$1,500)
- **Credit**: Business Bank Account (-$1,500)

##### **Making a Sale**
- **Debit**: Accounts Receivable (+$500)
- **Credit**: Consulting Revenue (+$500)

---

## 📊 GST Management Guide

### GST Registration Settings
1. **Navigate**: User Profile → Settings
2. **GST Status**:
   - ✅ **Registered**: You charge GST and file returns
   - ❌ **Not Registered**: No GST obligations
3. **Return Frequency**:
   - **Bi-monthly** (every 2 months) - Standard
   - **Six-monthly** (every 6 months) - Small business option

### GST Invoice Scenarios

#### **Scenario 1: GST-Inclusive B2C Business**
- **Example**: Retail store, cafe, salon
- **Settings**: ✅ GST Inclusive, ❌ Not Exempt
- **Customer sees**: Final price including GST
- **You get**: Price minus GST component

#### **Scenario 2: GST-Exclusive B2B Business** 
- **Example**: Consultant, lawyer, accountant
- **Settings**: ❌ GST Inclusive, ❌ Not Exempt
- **Customer sees**: Price + GST as separate line
- **You get**: Base price + GST component

#### **Scenario 3: Mixed GST Business**
- **Example**: Business serving both consumers and businesses
- **Flexibility**: Choose per invoice
- **B2C invoices**: GST-inclusive
- **B2B invoices**: GST-exclusive

#### **Scenario 4: Non-GST Registered Business**
- **Example**: Small sole trader under $60k revenue
- **Settings**: ✅ GST Exempt
- **Result**: No GST charged at all

### GST Compliance Dashboard
1. **Navigate**: Dashboard → Tax Filing (PREMIUM only for full features)
2. **View**:
   - Current GST period summary
   - Output tax (GST on sales) vs Input tax (GST on purchases)
   - Net GST payable or refund
   - Filing deadlines and compliance status
   - Year-to-date GST summary

---

## 📈 Reports & Analytics

### Available Reports (FREE Tier)
1. **Navigate**: Dashboard → Reports
2. **Standard Reports**:
   - **Profit & Loss**: Revenue vs Expenses
   - **Balance Sheet**: Assets vs Liabilities + Equity
   - **Transaction Reports**: Detailed transaction history
   - **Customer Statements**: Outstanding invoices per customer

### Advanced Analytics (PREMIUM Tier)
1. **Business Health Score**: 
   - Financial health rating (0-100)
   - Industry benchmarking
   - Improvement recommendations
2. **Advanced Tax Analytics**:
   - GST trend analysis
   - Tax planning insights
   - Compliance scoring
3. **AI-Powered Insights** (When enabled):
   - Natural language financial queries
   - Automated report explanations
   - Business growth recommendations

---

## 🎯 Demo Account Exploration Guide

### 🆓 **Exploring the FREE Account** (`demo.free@amplifibi.com`)

#### **What to Check:**
1. **Dashboard Overview**:
   - Notice working quick action buttons
   - View financial summary cards
   - See "Free" badge in user profile
2. **Customer Management**:
   - Browse 5 sample customers
   - Check different GST registration statuses
   - Notice payment terms variety
3. **Invoice Scenarios**:
   - **INV-F001**: GST Inclusive, PAID status
   - **INV-F002**: GST Exclusive, SENT status  
   - **INV-F003**: GST Exempt, DRAFT status
   - **INV-F004**: GST Inclusive, OVERDUE status
4. **Chart of Accounts**:
   - Review complete NZ business accounts
   - Check realistic account balances
   - See GST Payable account
5. **Transactions**:
   - View sample double-entry transactions
   - See invoice payments recorded
   - Check GST payment entries
6. **Premium Features**:
   - Notice "Pro" badges on Health Score and Tax Filing
   - Understand upgrade incentives

### 💎 **Exploring the PREMIUM Account** (`demo.premium@amplifibi.com`)

#### **Additional Premium Access:**
1. **Business Health Score**:
   - View comprehensive health dashboard
   - See scoring methodology
   - Check industry benchmarks
2. **Advanced Tax Management**:
   - Full GST return preparation
   - Six-monthly return frequency
   - Compliance tracking
3. **Enhanced Analytics**:
   - Advanced reporting features
   - Trend analysis
   - Financial projections

#### **Compare Experience:**
- **Same financial data** in both accounts
- **Different access levels** to premium features
- **Identical core accounting** functionality
- **Premium user sees no restrictions**

---

## 💡 Best Practices

### 1. **Customer Setup**
- Always collect GST numbers for business customers
- Set accurate payment terms
- Keep contact information updated

### 2. **Invoice Management**  
- Choose correct GST treatment per customer type
- Use clear, detailed item descriptions
- Set realistic due dates
- Follow up on overdue invoices promptly

### 3. **Transaction Recording**
- Record transactions promptly
- Use clear, searchable descriptions
- Categorize transactions properly
- Reconcile with bank statements regularly

### 4. **GST Compliance**
- Set your GST registration status correctly
- Choose appropriate return frequency
- Monitor GST payable account
- Keep accurate records for IRD

### 5. **Financial Health**
- Review dashboard metrics regularly
- Monitor cash flow trends
- Track key performance indicators
- Plan for tax obligations

---

## 🆘 Common Tasks & Workflows

### **Workflow 1: Processing a New Sale**
1. **Create Customer** (if new)
2. **Create Invoice** with appropriate GST settings
3. **Send Invoice** to customer
4. **Record Payment** when received
5. **Monitor** accounts receivable aging

### **Workflow 2: Recording Business Expenses**
1. **Dashboard** → "Add Transaction"
2. **Debit**: Expense account (e.g., Office Rent)
3. **Credit**: Payment account (e.g., Bank Account)
4. **Categorize**: Choose appropriate category
5. **Save**: Updates account balances automatically

### **Workflow 3: End-of-Month GST Review**
1. **Check GST Payable** account balance
2. **Review Tax Dashboard** (PREMIUM)
3. **Prepare GST Return** data
4. **Record GST Payment** to IRD
5. **File Return** with tax authority

### **Workflow 4: Financial Health Check**
1. **Dashboard**: Review key metrics
2. **Reports**: Generate P&L and Balance Sheet
3. **Health Score**: Check business health rating (PREMIUM)
4. **Action Items**: Address any red flags

---

## 🔧 Advanced Configuration

### GST Configuration Options

#### **For Small Businesses** (Under $60k annual turnover)
- **Registration**: Optional
- **Recommendation**: Stay unregistered unless customer requirements demand it
- **Settings**: Use "GST Exempt" for all invoices

#### **For Growing Businesses** ($60k - $24M turnover)
- **Registration**: Required when exceeding $60k
- **Frequency**: Bi-monthly returns (every 2 months)
- **Settings**: Choose GST-inclusive or exclusive based on customer base

#### **For Large Businesses** (Over $24M turnover)
- **Registration**: Mandatory
- **Frequency**: Monthly returns required
- **Settings**: Usually GST-exclusive for B2B transactions

---

## 📞 Support & Help

### Getting Help
1. **In-App Help**: Dashboard → Help
2. **Documentation**: This user manual
3. **Community Support**: FREE tier users
4. **Priority Support**: PREMIUM tier users

### Common Issues & Solutions

#### **Problem**: Can't see premium features
**Solution**: Upgrade to PREMIUM or use demo accounts to test

#### **Problem**: GST calculations seem wrong
**Solution**: Check GST-inclusive vs exclusive settings on invoice

#### **Problem**: Invoice numbers not sequential
**Solution**: System auto-generates unique numbers per user

#### **Problem**: Dashboard buttons not working
**Solution**: Issue has been fixed - buttons now navigate properly

---

## 🎓 Learning Path for New Users

### **Week 1: Foundation**
1. **Day 1-2**: Explore with demo accounts
2. **Day 3-4**: Create your first customer and invoice
3. **Day 5-7**: Record your first transactions

### **Week 2: Core Operations**
1. **Day 8-10**: Set up all your customers
2. **Day 11-12**: Create and send real invoices
3. **Day 13-14**: Record payments and expenses

### **Week 3: Advanced Features**  
1. **Day 15-17**: Explore reporting features
2. **Day 18-19**: Set up GST compliance properly
3. **Day 20-21**: Consider PREMIUM upgrade for advanced features

### **Week 4: Optimization**
1. **Day 22-24**: Streamline your workflows
2. **Day 25-26**: Set up bank integration (PREMIUM)
3. **Day 27-28**: Master business health monitoring

---

## 🌟 Pro Tips

### **Efficiency Tips**
- Use **Quick Actions** on dashboard for common tasks
- Set up **customers first** before creating invoices
- Use **categories** to organize expenses for better reporting
- **Reconcile regularly** with your actual bank statements

### **GST Tips**
- **Know your customers**: Business customers often prefer GST-exclusive pricing
- **Keep it simple**: Choose one method (inclusive/exclusive) and stick to it
- **Document everything**: Good records make GST returns easier
- **Plan for payments**: Set aside GST collected for IRD payments

### **Business Growth Tips**
- **Monitor cash flow**: Use dashboard metrics daily
- **Track trends**: Watch for seasonal patterns
- **Upgrade strategically**: PREMIUM features pay for themselves with business insights
- **Automate where possible**: Bank integration saves hours of data entry

---

*Need more help? Contact support or explore our demo accounts to see all features in action!*

**AmplifiBI** - Making business finance simple, smart, and compliant for New Zealand businesses.