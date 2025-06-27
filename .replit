
[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "cd backend && npm install && npm run build && npm start"]

run = "npm install && cd backend && npm install && npm run dev & cd ../frontend && npm install && npm run dev & cd ../crowdfunding-app && npm install && npm run dev & wait"
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80
exposeLocalhost = true

[[ports]]
localPort = 4000
externalPort = 4000
exposeLocalhost = true

[[ports]]
localPort = 3001
externalPort = 3001
exposeLocalhost = true

[[ports]]
localPort = 5432
externalPort = 5432
exposeLocalhost = false

[[ports]]
localPort = 27017
externalPort = 27017
exposeLocalhost = false

[[ports]]
localPort = 6379
externalPort = 6379
exposeLocalhost = false

[env]
NODE_ENV = "development"
DATABASE_URL = "postgresql://fastbite:password@0.0.0.0:5432/fastbite"
MONGO_URL = "mongodb://0.0.0.0:27017/fastbite"
REDIS_URL = "redis://0.0.0.0:6379"
GRAPHQL_ENDPOINT = "http://0.0.0.0:4000/graphql"
WEBSOCKET_URL = "ws://0.0.0.0:4000"
CLIENT_URL = "http://0.0.0.0:3000"
CROWDFUNDING_URL = "http://0.0.0.0:3001"
NEXT_PUBLIC_BASE_RPC = "https://base-sepolia.g.alchemy.com/v2/demo"
NEXT_PUBLIC_GRAPHQL_ENDPOINT = "http://0.0.0.0:4000/graphql"
JWT_SECRET = "fastbite-dev-secret-key-change-in-production"
JWT_EXPIRES_IN = "24h"
COINBASE_APP_ID = "your-coinbase-app-id"
COINBASE_AGENTKIT_KEY = "your-agentkit-key"
ETHERSCAN_API_KEY = "your-etherscan-api-key"
PERSONA_API_KEY = "your-persona-api-key"
STRIPE_SECRET_KEY = "sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_your-stripe-publishable-key"
TWILIO_ACCOUNT_SID = "your-twilio-sid"
TWILIO_AUTH_TOKEN = "your-twilio-auth-token"
SENDGRID_API_KEY = "your-sendgrid-api-key"
EMAIL_FROM = "noreply@fastbitepro.com"
EMAIL_USER = "your-email@gmail.com"
EMAIL_APP_PASSWORD = "your-app-password"
ADMIN_WALLET = "0xCc380FD8bfbdF0c020de64075b86C84c2BB0AE79"
FBT_TOKEN_ADDRESS = "0x..."
PAYOUT_CONTRACT_ADDRESS = "0x..."
DAO_CONTRACT_ADDRESS = "0x..."
PRIVATE_KEY = "your-private-key-for-deployments"
RPC_URL = "https://base-sepolia.g.alchemy.com/v2/demo"

[workflows]
runButton = "Run FastBite Pro"

[[workflows.workflow]]
name = "Setup Databases"
author = 29890612
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Setting up databases...\""

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "mkdir -p data/postgres data/mongo data/redis"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Databases ready\""

[[workflows.workflow]]
name = "Install Dependencies"
author = 29890612
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Installing dependencies for all services...\""

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"backend\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd backend && npm install && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"frontend\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd frontend && npm install && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"crowdfunding-app\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd crowdfunding-app && npm install && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"All dependencies installed\""

[[workflows.workflow]]
name = "Run FastBite Pro"
author = 29890612
mode = "parallel"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "cd backend && npm run dev &"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "cd frontend && npm run dev &"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "cd crowdfunding-app && npm run dev &"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "wait"

[[workflows.workflow]]
name = "Database Migration"
author = 29890612
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Running database migrations...\""

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "cd backend && npm run migrate"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Migrations completed\""

[[workflows.workflow]]
name = "Deploy Smart Contracts"
author = 29890612
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Deploying smart contracts to Base Sepolia...\""

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "cd backend && npx hardhat run scripts/deploy.ts --network baseSepolia"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Smart contracts deployed\""

[[workflows.workflow]]
name = "Run Tests"
author = 29890612
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"Running all tests...\""

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"backend\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd backend && npm test && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"frontend\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd frontend && npm test && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "if [ -d \"crowdfunding-app\" ]; then"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "  cd crowdfunding-app && npm test && cd .."

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "fi"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "echo \"All tests completed\""
