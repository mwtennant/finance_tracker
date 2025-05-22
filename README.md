# Finance Tracker

A personal finance tracker application built with React, Express, and PostgreSQL. This application helps users manage their financial plans and accounts, track spending, and organize their financial goals.

## Features

- **Financial Plan Management**: Create, update, and manage financial plans
- **Account Management**: Track different types of accounts:
  - Standard bank accounts
  - Credit accounts
  - Loans
  - Investment accounts
- **Plan-Account Linking**: Link accounts to specific financial plans
- **Visualization**: View account information and plan summaries

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Development Tools**: Docker, Git

## Getting Started

### Prerequisites

- Node.js v14+ and npm
- Docker and Docker Compose (for database)
- PostgreSQL (alternative to Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd finance_tracker
   ```

2. Install dependencies:

   ```bash
   # Root project dependencies
   npm install

   # Client dependencies
   cd client && npm install

   # Server dependencies
   cd ../server && npm install
   ```

3. Set up the database:

   ```bash
   # Using Docker
   docker-compose up -d

   # OR manually with PostgreSQL
   cd server
   ./setup-db.sh
   ```

4. Start the development servers:

   ```bash
   # Start both client and server using the root package.json script
   npm run dev

   # OR start them separately

   # In the server directory
   cd server
   npm run dev

   # In the client directory (new terminal)
   cd client
   npm start
   5. Open the application in your browser:
   ```

   http://localhost:3001

   ```

   ```

## API Endpoints

### Plans

- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Accounts

- `GET /api/accounts` - Get all standard accounts
- `POST /api/accounts` - Create standard account
- `PUT /api/accounts/:id` - Update standard account
- `DELETE /api/accounts/:id` - Delete standard account

### Credit Accounts

- `GET /api/credit-accounts` - Get all credit accounts
- `POST /api/credit-accounts` - Create credit account
- `PUT /api/credit-accounts/:id` - Update credit account
- `DELETE /api/credit-accounts/:id` - Delete credit account

### Loans

- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create loan
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

### Investment Accounts

- `GET /api/investment-accounts` - Get all investment accounts
- `POST /api/investment-accounts` - Create investment account
- `PUT /api/investment-accounts/:id` - Update investment account
- `DELETE /api/investment-accounts/:id` - Delete investment account

### Account Linking

- `POST /api/plans/:planId/accounts` - Link account to plan
- `DELETE /api/plans/:planId/accounts/:accountId` - Unlink account from plan

## Useful Commands

### Kill any processes running on the application ports and restart the app:

```bash
# Kill processes on ports 3001 & 5002 and restart the app
cd /Users/matthewwtennant/Documents/Code/finance_tracker/v_01 && ./restart-app.sh
```

### Run database migrations:

```bash
cd server && ./setup-db.sh
```

## Troubleshooting

If you encounter database errors, try running the specific fix scripts in the server directory:

```bash
cd server
./fix-term-months.sh
./fix-loan-interest-history.sh
```

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

---

\_Last updated: 2025-05-21_17_10
