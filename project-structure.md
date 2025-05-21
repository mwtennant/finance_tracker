# Project Structure

This document outlines the current folder and file structure of the project. It excludes dependency-related files such as `node_modules`, `.next`, `dist`, and lock files.

```
finance_tracker/
├── docker-compose.yml
├── package.json
├── project-structure.md
├── README.md
├── Codebase_Review_Finance_Tracker.md
├── client/
│   ├── craco.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── index.jsx
│       ├── components/
│       │   ├── AccountForm.jsx
│       │   ├── AccountList.jsx
│       │   ├── AccountModal.jsx
│       │   ├── AccountsDashboard.jsx
│       │   ├── ConfirmationModal.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ErrorBoundary.jsx
│       │   ├── ExampleComponent.jsx
│       │   ├── IncludedAccounts.jsx
│       │   ├── IncludedCreditCards.jsx
│       │   ├── IncludedInvestmentAccounts.jsx
│       │   ├── IncludedLoans.jsx
│       │   ├── LinkedAccountsSection.jsx
│       │   ├── NewPlanForm.jsx
│       │   ├── PlanDetailPage.jsx
│       │   ├── PlanForm.jsx
│       │   ├── PlanSummary.jsx
│       │   ├── PlansDashboard.jsx
│       │   └── TailwindTest.jsx
│       └── context/
│           ├── AccountContext.js
│           ├── NotificationContext.js
│           └── PlanContext.js
├── server/
│   ├── package.json
│   ├── setup-db.sh
│   └── src/
│       ├── app.js
│       ├── db.js
│       ├── controllers/
│       │   ├── accountController.js
│       │   ├── creditAccountController.js
│       │   ├── exampleController.js
│       │   ├── investmentAccountController.js
│       │   ├── loanController.js
│       │   └── planController.js
│       ├── db/
│       │   └── schema.sql
│       ├── middleware/
│       │   ├── errorMiddleware.js
│       │   └── loggingMiddleware.js
│       └── routes/
│           ├── accountRoutes.js
│           ├── creditAccountRoutes.js
│           ├── index.js
│           ├── investmentAccountRoutes.js
│           ├── loanRoutes.js
│           └── planRoutes.js
```

---

_Last updated: 2025-05-20_

This file is automatically updated whenever a file or folder is added, renamed, or removed. Only source code, configuration, and documentation files relevant to the project are included.
