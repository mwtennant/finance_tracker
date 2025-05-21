#!/bin/bash
echo "Fixing node_modules tracking issue and staging required files..."

# Create a backup of the current .gitignore
cp .gitignore .gitignore.bak

# Make sure node_modules is properly ignored
echo '# Dependencies
node_modules/
/node_modules
/**/node_modules/
.pnp
.pnp.js
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.idea/
.vscode/
*.sublime-*
' > .gitignore

# Remove all tracked node_modules files from git index
git rm --cached -r client/node_modules

# Add specific files for commit
git add docker-compose.yml server/src/db/schema.sql .gitignore

echo "Files staged for commit. Ready to commit!"
