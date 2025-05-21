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

## Project Structure

```
finance_tracker/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AccountForm.jsx           # Add/edit accounts
│   │   │   ├── AccountList.jsx           # Display accounts
│   │   │   ├── AccountsDashboard.jsx     # Main accounts page
│   │   │   ├── AccountModal.jsx          # Link accounts to plans
│   │   │   ├── LinkedAccountsSection.jsx # Show linked accounts
│   │   │   ├── PlanDetailPage.jsx        # Plan details view
│   │   │   └── ...                       # Other components
│   │   └── context/      # React context for state management
│   │       ├── AccountContext.js         # Account state and API calls
│   │       ├── NotificationContext.js    # Notification system
│   │       └── PlanContext.js            # Plan state and API calls
│   └── public/           # Public assets
├── server/               # Backend Express application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   │   ├── accountController.js         # Standard accounts
│   │   │   ├── creditAccountController.js   # Credit accounts
│   │   │   ├── loanController.js            # Loans
│   │   │   ├── investmentAccountController.js # Investment accounts
│   │   │   └── planController.js            # Financial plans
│   │   ├── routes/       # API route definitions
│   │   ├── db/           # Database scripts
│   │   └── middleware/   # Express middleware
│   └── setup-db.sh       # Database setup script
└── docker-compose.yml    # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js v14+ and npm
- Docker and Docker Compose (for database)
- PostgreSQL (alternative to Docker)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd finance_tracker
   ```

2. Install dependencies:

   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up the database:

   ```
   # Using Docker
   docker-compose up -d

   # OR manually with PostgreSQL
   cd server
   ./setup-db.sh
   ```

4. Start the development servers:

   ```
   # In the server directory
   npm run dev

   # In the client directory (new terminal)
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000
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
- `DELETE /api/plans/:planId/accounts` - Unlink account from plan

## License

This project is licensed under the MIT License.

_Last updated: 2025-05-20_
npm install

```

3. Install dependencies for the client:
```

cd client
npm install

```

### Configuration

1. Create a `.env` file in the `server` directory and add your environment variables:
```

DATABASE_URL=your_database_url

```

### Running the Application

1. Start the server:

```

cd server
npm start

```

2. Start the client:
```

cd client
npm start

```

### Docker

To run the application using Docker, use the following command:

```

docker-compose up

```

## Usage

Visit `http://localhost:3001` to view the application in your browser. The API will be available at `http://localhost:5002`.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
```
