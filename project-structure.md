# Project Structure

This document outlines the current folder and file structure of the project.

```
finance_tracker/
├── client/                # Frontend React application
│   ├── craco.config.js    # Create React App configuration override
│   ├── package.json       # Client dependencies and scripts
│   ├── postcss.config.js  # PostCSS configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── public/            # Public assets
│   │   └── index.html     # HTML entry point
│   └── src/               # Client source code
│       ├── App.jsx        # Main application component
│       ├── index.css      # Global styles
│       ├── index.jsx      # Application entry point
│       ├── components/    # React components
│       │   ├── AccountForm.jsx           # Form for adding/editing accounts
│       │   ├── AccountList.jsx           # List of accounts
│       │   ├── AccountModal.jsx          # Modal for account operations
│       │   ├── AccountsDashboard.jsx     # Main accounts page
│       │   ├── ConfirmationModal.jsx     # Confirmation dialog component
│       │   ├── Dashboard.jsx             # Main dashboard view
│       │   ├── ErrorBoundary.jsx         # Error handling component
│       │   ├── IncludedAccounts.jsx      # Shows accounts in a plan
│       │   ├── IncludedCreditCards.jsx   # Shows credit cards in a plan
│       │   ├── IncludedInvestmentAccounts.jsx # Shows investment accounts in a plan
│       │   ├── IncludedLoans.jsx         # Shows loans in a plan
│       │   ├── LinkedAccountsSection.jsx # Section showing linked accounts
│       │   ├── NewPlanForm.jsx           # Form for creating new plans
│       │   ├── PlanDetailPage.jsx        # Plan details view
│       │   ├── PlanForm.jsx              # Form for plan operations
│       │   ├── PlansDashboard.jsx        # Plans overview page
│       │   ├── PlanSummary.jsx           # Summary of a plan
│       │   └── TransactionForm.jsx       # Form for transactions
│       ├── context/       # React context providers
│       │   ├── AccountContext.js         # Account data and API integration
│       │   ├── NotificationContext.js    # Application notifications
│       │   └── PlanContext.js            # Plan data and API integration
│       └── __tests__/     # Frontend tests
│           ├── PlanCreation.comprehensive.test.jsx
│           ├── PlanCreation.integration.test.jsx
│           ├── PlanDetailPage.test.jsx
│           └── PlansDashboard.test.jsx
├── server/                # Backend Express application
│   ├── package.json       # Server dependencies and scripts
│   ├── setup-db.sh        # Database setup script
│   ├── fix-term-months.sh # Fix for term_months null issue
│   ├── fix-loan-interest-history.sh # Fix for loan interest history table
│   └── src/               # Server source code
│       ├── app.js         # Express application setup
│       ├── db.js          # Database connection
│       ├── controllers/   # API controllers
│       │   ├── accountController.js         # Standard accounts
│       │   ├── creditAccountController.js   # Credit accounts
│       │   ├── investmentAccountController.js # Investment accounts
│       │   ├── loanController.js            # Loans
│       │   └── planController.js            # Financial plans
│       ├── db/            # Database scripts and migrations
│       │   ├── schema.sql                   # Main schema
│       │   └── migrations/                  # DB migrations
│       │       ├── add_apr_column.sql
│       │       ├── allow_null_term_months.sql
│       │       └── create_loan_interest_history.sql
│       ├── middleware/    # Express middleware
│       │   ├── errorMiddleware.js           # Error handling
│       │   └── loggingMiddleware.js         # Request logging
│       ├── routes/        # API routes
│       │   ├── accountRoutes.js
│       │   ├── creditAccountRoutes.js
│       │   ├── index.js                     # Root router
│       │   ├── investmentAccountRoutes.js
│       │   ├── loanRoutes.js
│       │   └── planRoutes.js
│       └── __tests__/     # Backend tests
│           ├── plan_creation.integration.test.js
│           ├── plan-creation.test.js
│           └── plans.api.test.js
├── docker-compose.yml     # Docker configuration
├── package.json           # Root dependencies and scripts
├── restart-app.sh         # Script to restart client and server
└── README.md              # Project documentation
```

## Development Scripts

- `npm run dev` - Start both client and server
- `./restart-app.sh` - Kill processes on ports 3001 & 5002 and restart the app
- `./server/setup-db.sh` - Set up the database schema and apply migrations

---

_Last updated: 2025-05-21_
