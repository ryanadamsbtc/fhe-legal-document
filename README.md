# FHE Legal Document Management System

A privacy-preserving legal document management platform built with Fully Homomorphic Encryption (FHE) technology. This decentralized application enables users to securely store, encrypt, and selectively share sensitive legal documents while maintaining complete confidentiality on the blockchain.

## 🌟 Overview

The FHE Legal Document Management System combines cutting-edge cryptographic technology with blockchain infrastructure to solve the critical problem of secure document storage and controlled access. By leveraging Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), this platform ensures that sensitive legal documents remain encrypted both at rest and during computation, providing unprecedented privacy guarantees.

### Key Innovation

Traditional blockchain solutions expose data to validators and nodes, making them unsuitable for sensitive documents. This project implements a hybrid encryption approach:

1. **Client-side AES-GCM encryption** for document content
2. **FHE-encrypted secret keys** stored on-chain
3. **Selective decryption** through cryptographic access control
4. **Zero-knowledge privacy** - even smart contract operations don't reveal plaintext data

## ✨ Features

### Core Capabilities

- **End-to-End Encrypted Storage**: Documents are encrypted client-side using AES-GCM with randomly generated 256-bit keys
- **Blockchain-Based Access Control**: Encrypted secret keys stored securely on Ethereum using FHEVM
- **Selective Sharing**: Grant decryption rights to specific Ethereum addresses without revealing the document
- **Privacy-Preserving Metadata**: Store document names, hashes, and timestamps while keeping content confidential
- **Decentralized Architecture**: No central authority or trusted third party required
- **Wallet-Based Authentication**: Seamless integration with Web3 wallets via RainbowKit
- **Persistent Encrypted Storage**: Client-side IndexedDB storage for encrypted document payloads

### Security Features

- **FHE-Protected Secret Keys**: Encryption keys stored as homomorphically encrypted values on-chain
- **Client-Side Key Generation**: Random secret generation in the browser using Web Crypto API
- **Cryptographic Hash Verification**: SHA-256 hashing for document integrity
- **No Server-Side Secrets**: Zero-trust architecture with no backend key management
- **Granular Access Control**: Per-document permission management
- **EIP-712 Signed Decryption**: Type-safe user authorization for decryption operations

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌────────────┬──────────────┬────────────┬──────────────────┐  │
│  │ RainbowKit │  Wagmi/Viem  │  Ethers.js │ Zama Relayer SDK │  │
│  └────────────┴──────────────┴────────────┴──────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Web Crypto API (AES-GCM, SHA-256)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           IndexedDB (Encrypted Document Storage)           │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Ethereum Blockchain (Sepolia)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              LegalDocs Smart Contract (FHEVM)              │  │
│  │                                                            │  │
│  │  • Document Metadata (name, hash, timestamp)              │  │
│  │  • FHE-Encrypted Secret Keys (euint256)                   │  │
│  │  • Access Control Mappings (eaddress)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Zama FHE Infrastructure                     │
│  • FHE Coprocessor for encrypted computation                    │
│  • Relayer Network for decryption services                      │
│  • Key Management Protocol (EIP-712 signatures)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Encryption Workflow

#### Document Upload Flow:
```
1. User inputs document content in browser
2. Generate random 256-bit secret key (A)
3. Encrypt document with AES-GCM using key A → Ciphertext
4. Hash encrypted payload with SHA-256 → Document ID (ipfsHash)
5. Store encrypted payload in IndexedDB under document ID
6. Encrypt secret key A with FHEVM → euint256
7. Submit to smart contract: metadata + encrypted secret key
8. Blockchain stores: {name, ipfsHash, timestamp, euint256}
```

#### Document Decryption Flow:
```
1. User requests document decryption
2. Retrieve encrypted secret handle from smart contract
3. Generate keypair for FHE decryption request
4. Sign EIP-712 authorization message with wallet
5. Submit decryption request to Zama relayer
6. Receive decrypted secret key A
7. Fetch encrypted payload from IndexedDB using ipfsHash
8. Decrypt payload with AES-GCM using key A
9. Display plaintext document to authorized user
```

## 🔧 Technology Stack

### Blockchain & Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract programming language |
| **FHEVM** | @fhevm/solidity ^0.8.0 | Fully Homomorphic Encryption library |
| **Hardhat** | ^2.26.0 | Ethereum development environment |
| **Ethers.js** | ^6.15.0 | Ethereum library for blockchain interaction |
| **OpenZeppelin** | N/A | Secure smart contract standards |

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.1 | UI component framework |
| **TypeScript** | ~5.8.3 | Type-safe JavaScript |
| **Vite** | ^7.1.6 | Fast build tool and dev server |
| **Wagmi** | ^2.17.0 | React Hooks for Ethereum |
| **Viem** | ^2.37.6 | TypeScript Ethereum library |
| **RainbowKit** | ^2.2.8 | Wallet connection UI |
| **TanStack Query** | ^5.89.0 | Data fetching and caching |

### Cryptography & Privacy

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zama FHE** | @zama-fhe/relayer-sdk ^0.2.0 | Fully Homomorphic Encryption SDK |
| **Web Crypto API** | Native | Browser-based cryptographic operations |
| **AES-GCM** | Native | Symmetric encryption algorithm |
| **SHA-256** | Native | Cryptographic hash function |
| **EIP-712** | Standard | Typed structured data signing |

### Development Tools

| Tool | Purpose |
|------|---------|
| **TypeChain** | Generate TypeScript bindings for smart contracts |
| **Hardhat Deploy** | Declarative deployment management |
| **Chai** | Testing framework for assertions |
| **ESLint** | Code quality and consistency |
| **Prettier** | Code formatting |
| **Solhint** | Solidity linting |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher (or yarn/pnpm)
- **MetaMask** or another Web3 wallet browser extension
- **Git**: For cloning the repository

### Recommended Setup

- **Operating System**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 8GB (16GB recommended for development)
- **Disk Space**: 2GB+ for dependencies and build artifacts

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fhe-legal-document.git
cd fhe-legal-document
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Deployment wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Infura API key for Sepolia testnet access
INFURA_API_KEY=your_infura_api_key_here

# Etherscan API key for contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Warning**: Never commit your `.env` file to version control. The `.gitignore` file should already exclude it.

### 5. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain TypeScript bindings
- Create ABI files for frontend integration

### 6. Run Tests

```bash
# Run tests on local Hardhat network with FHE mock
npm run test

# Run tests on Sepolia testnet (requires deployed contract)
npm run test:sepolia
```

### 7. Deploy Smart Contract

#### Local Development Network

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:localhost
```

#### Sepolia Testnet

```bash
# Deploy and generate ABI for frontend
npm run deploy:sepolia

# Verify contract on Etherscan (optional)
npm run verify:sepolia
```

The deployment script will output the contract address. Copy this address for frontend configuration.

### 8. Configure Frontend

Update `frontend/src/abi/legalDocs.ts` with your deployed contract address:

```typescript
export const legalDocsAddress = "0xYourDeployedContractAddress";
```

The ABI is automatically generated during deployment.

### 9. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### 10. Build for Production

```bash
# Build smart contracts
npm run compile

# Build frontend
cd frontend
npm run build
```

## 📖 Usage Guide

### Connecting Your Wallet

1. Navigate to the application homepage
2. Click the "Connect Wallet" button in the top-right corner
3. Select your preferred wallet provider (MetaMask, WalletConnect, etc.)
4. Approve the connection request
5. Ensure you're connected to the Sepolia testnet

### Saving a Document

1. **Enter Document Details**:
   - **Document Name**: A descriptive name for your document
   - **Document Content**: The sensitive text content to encrypt
   - **Document ID**: A unique numeric identifier (auto-generated as timestamp)

2. **Click "Encrypt + Save"**:
   - The system generates a random 256-bit encryption key
   - Your document is encrypted locally using AES-GCM
   - The encrypted content is stored in your browser's IndexedDB
   - The encryption key is FHE-encrypted and sent to the blockchain
   - A transaction is submitted to the smart contract

3. **Confirm Transaction**:
   - Your wallet will prompt for transaction approval
   - Gas fees will be required (ensure you have Sepolia ETH)
   - Wait for transaction confirmation

4. **Verification**:
   - Once confirmed, your document appears in "Your Documents" list
   - The blockchain stores: name, hash, and timestamp
   - The encrypted content remains in local storage

### Viewing Your Documents

The "Your Documents" section displays all documents you've saved:

- **Document Name**: The name you provided
- **Hash**: SHA-256 hash of the encrypted content (used as identifier)
- **Saved**: Timestamp of when the document was saved
- **DocId**: The unique document identifier

### Decrypting a Document

1. **Locate the Document**: Find the document in your list
2. **Click "Decrypt"**:
   - The system retrieves the FHE-encrypted key from the blockchain
   - You'll be prompted to sign an EIP-712 message (no gas fee)
   - The signature authorizes decryption via Zama relayer
   - The decrypted key is used to decrypt the content from IndexedDB
   - The plaintext is displayed in an alert

**Note**: You can only decrypt documents you own or have been granted access to.

### Granting Access to Others

To allow another Ethereum address to decrypt a document:

1. **Enter Document ID**: Specify which document to share
2. **Enter Address**: Provide the Ethereum address to grant access
3. **Click "Allow"**:
   - A transaction is submitted to the smart contract
   - The recipient's address is authorized for decryption
   - They can now decrypt the document using their wallet

### Security Best Practices

- **Backup Your Documents**: The encrypted content is stored in browser storage. Export important documents or maintain local backups.
- **Secure Your Wallet**: Your wallet controls document ownership and access. Use a hardware wallet for maximum security.
- **Verify Recipients**: Double-check Ethereum addresses before granting access. Access cannot be revoked once granted.
- **Gas Management**: Keep sufficient Sepolia ETH for transactions. Get free testnet ETH from faucets.

## 🎯 Problem Statement & Solution

### The Problem

Legal professionals, enterprises, and individuals face critical challenges in document management:

1. **Privacy Violations**: Traditional cloud storage exposes documents to service providers and potential breaches
2. **Centralized Control**: Single points of failure and censorship risks
3. **Access Management**: Complex permission systems vulnerable to unauthorized access
4. **Regulatory Compliance**: GDPR, HIPAA, and other regulations require strict data protection
5. **Trust Issues**: Reliance on third-party intermediaries for security
6. **Blockchain Transparency**: Public blockchains expose all data to validators and observers

### The Solution

This project provides a revolutionary approach to secure document management:

#### 1. **True End-to-End Encryption**
- Documents never exist in plaintext on servers or blockchain
- Client-side encryption ensures only users control decryption keys
- Even smart contract code cannot access document content

#### 2. **Cryptographic Access Control**
- FHE enables computation on encrypted data without decryption
- Smart contracts manage permissions while maintaining privacy
- Granular control over who can decrypt each document

#### 3. **Decentralization Benefits**
- No single entity controls your documents
- Censorship-resistant storage and access
- Blockchain immutability provides audit trails

#### 4. **Zero-Knowledge Privacy**
- Blockchain validators cannot see document content or keys
- Zama's coprocessor performs encrypted computations
- Only authorized users can decrypt through cryptographic proofs

#### 5. **Compliance-Ready Architecture**
- Data sovereignty: Users maintain control over their information
- Audit trails: Immutable blockchain records of all operations
- Right to deletion: Encrypted data is meaningless without keys

#### 6. **Practical Usability**
- Familiar Web3 wallet integration
- Intuitive user interface
- No complex key management for end users

## 🔬 Advanced Features & Technical Details

### Smart Contract Architecture

The `LegalDocs` contract implements a sophisticated access control system:

```solidity
contract LegalDocs {
    // Storage structures
    struct DocMeta {
        string name;        // Document name (public metadata)
        string ipfsHash;    // Content hash for retrieval
        uint256 savedAt;    // Timestamp of creation
    }

    // Multi-level mapping for document organization
    mapping(address => mapping(uint256 => DocMeta)) private _docs;
    mapping(address => uint256[]) private _docIds;
    mapping(address => mapping(uint256 => euint256)) private _secrets;
    mapping(address => mapping(uint256 => eaddress)) private _allowed;
}
```

**Key Functions**:

- `saveDocument()`: Stores FHE-encrypted secret and metadata
- `listDocuments()`: Returns all documents for a given address
- `getSecret()`: Retrieves encrypted secret for authorized decryption
- `allowSecret()`: Grants decryption rights to another address

### FHE Type System

The contract uses Zama's encrypted types:

- **`euint256`**: Encrypted 256-bit unsigned integer (for secret keys)
- **`eaddress`**: Encrypted Ethereum address (for privacy-preserving access control)
- **`externalEuint256`**: External encrypted input from client

### Client-Side Cryptography

#### AES-GCM Encryption

```typescript
// 256-bit key generation
const secretKey = crypto.getRandomValues(new Uint8Array(32));

// Encrypt document content
const { iv, ciphertext } = await aesGcmEncrypt(secretKey, documentBytes);

// Payload: IV (12 bytes) + Ciphertext
const payload = concat([iv, ciphertext]);
```

**Why AES-GCM?**
- **Authenticated Encryption**: Provides both confidentiality and integrity
- **Performance**: Fast encryption/decryption in browsers via Web Crypto API
- **Security**: Industry-standard AEAD (Authenticated Encryption with Associated Data)

#### FHE Integration

```typescript
// Create encrypted input for smart contract
const input = await zamaInstance.createEncryptedInput(contractAddress, userAddress);
input.add256(secretKeyBigInt);
const encryptedInput = await input.encrypt();

// Submit to blockchain
await contract.saveDocument(docId, name, hash,
    encryptedInput.handles[0],
    encryptedInput.inputProof
);
```

#### User Decryption Protocol

```typescript
// Generate ephemeral keypair for decryption
const keypair = zamaInstance.generateKeypair();

// Create EIP-712 typed signature
const eip712 = zamaInstance.createEIP712(
    keypair.publicKey,
    [contractAddress],
    timestamp,
    durationDays
);

// User signs authorization
const signature = await signer.signTypedData(
    eip712.domain,
    eip712.types,
    eip712.message
);

// Request decryption from Zama relayer
const decryptedValues = await zamaInstance.userDecrypt({
    keypair,
    signature,
    handleContractPairs: [{ handle, contractAddress }]
});
```

### Storage Strategy

#### IndexedDB for Encrypted Content

- **Offline Capability**: Documents accessible without network
- **Large Storage**: No localStorage size limitations
- **Performance**: Asynchronous operations, no UI blocking
- **Privacy**: Data never leaves user's device

```typescript
// Store encrypted payload
await putCipher(documentHash, encryptedPayload);

// Retrieve for decryption
const encryptedPayload = await getCipher(documentHash);
```

#### Blockchain for Metadata & Keys

- **Immutability**: Tamper-proof records
- **Availability**: Global access to metadata
- **Access Control**: Smart contract enforced permissions
- **Audit Trail**: Complete history of operations

## 🛠️ Project Structure

```
fhe-legal-document/
│
├── contracts/                      # Solidity smart contracts
│   ├── LegalDocs.sol              # Main document management contract
│   └── FHECounter.sol             # Example FHE counter (template)
│
├── deploy/                        # Hardhat deployment scripts
│   └── deploy.ts                  # LegalDocs deployment configuration
│
├── tasks/                         # Hardhat custom tasks
│   ├── LegalDocs.ts              # LegalDocs-specific tasks
│   ├── FHECounter.ts             # Example tasks
│   └── accounts.ts               # Account management utilities
│
├── test/                          # Smart contract tests
│   ├── LegalDocs.ts              # Unit tests for LegalDocs
│   ├── FHECounter.ts             # Example tests
│   └── FHECounterSepolia.ts      # Sepolia integration tests
│
├── types/                         # TypeChain generated TypeScript types
│   ├── contracts/                # Contract type definitions
│   ├── factories/                # Contract factory types
│   └── index.ts                  # Exported types
│
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Home.tsx          # Main application interface
│   │   │   └── Header.tsx        # Navigation header
│   │   │
│   │   ├── config/               # Configuration files
│   │   │   └── wagmi.ts          # Wagmi/Web3 configuration
│   │   │
│   │   ├── abi/                  # Smart contract ABIs
│   │   │   └── legalDocs.ts      # LegalDocs ABI and address
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useZamaInstance.ts # FHE instance management
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── crypto.ts         # Cryptographic operations
│   │   │   └── storage.ts        # IndexedDB wrapper
│   │   │
│   │   ├── styles/               # CSS stylesheets
│   │   │   └── design-system.css # Design system variables
│   │   │
│   │   ├── App.tsx               # Root application component
│   │   ├── main.tsx              # Application entry point
│   │   └── vite-env.d.ts         # Vite type definitions
│   │
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite build configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── scripts/                       # Utility scripts
│   └── generate-frontend-abi.js  # ABI export for frontend
│
├── .github/                       # GitHub configuration
│   └── workflows/                # CI/CD workflows (if any)
│
├── hardhat.config.ts             # Hardhat configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
├── .env                          # Environment variables (not committed)
├── .gitignore                    # Git ignore rules
├── LICENSE                       # BSD-3-Clause-Clear license
└── README.md                     # This file
```

## 🧪 Testing

### Smart Contract Testing

The project includes comprehensive test coverage:

#### Unit Tests (Local Mock Mode)

```bash
npm run test
```

Tests run on Hardhat's local network with FHE in mock mode:

- **Document Saving**: Verifies metadata storage and FHE encryption
- **Document Listing**: Tests retrieval of all user documents
- **Secret Encryption**: Validates proper FHE handling of encryption keys
- **Access Control**: Tests permission granting to other addresses
- **Decryption**: Verifies authorized users can decrypt secrets

#### Integration Tests (Sepolia)

```bash
npm run test:sepolia
```

Tests against deployed contracts on Sepolia testnet:

- Real FHE coprocessor interaction
- Actual blockchain transactions
- End-to-end workflow validation
- Gas consumption analysis

### Frontend Testing

```bash
cd frontend
npm run lint
```

Current coverage includes:

- ESLint code quality checks
- TypeScript type checking
- React component linting

### Test Coverage

Generate coverage reports:

```bash
npm run coverage
```

Coverage includes:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## 📜 Available Scripts

### Backend (Root Directory)

| Script | Command | Description |
|--------|---------|-------------|
| Install | `npm install` | Install all dependencies |
| Compile | `npm run compile` | Compile Solidity contracts and generate types |
| Test | `npm run test` | Run all tests on local network |
| Test Sepolia | `npm run test:sepolia` | Run tests on Sepolia testnet |
| Coverage | `npm run coverage` | Generate test coverage report |
| Deploy Local | `npm run deploy:localhost` | Deploy to local Hardhat network |
| Deploy Sepolia | `npm run deploy:sepolia` | Deploy to Sepolia and generate ABI |
| Verify | `npm run verify:sepolia` | Verify contract on Etherscan |
| Lint | `npm run lint` | Run all linters (Solidity + TypeScript) |
| Lint Solidity | `npm run lint:sol` | Lint Solidity files |
| Lint TypeScript | `npm run lint:ts` | Lint TypeScript files |
| Format Check | `npm run prettier:check` | Check code formatting |
| Format Write | `npm run prettier:write` | Auto-format all files |
| Clean | `npm run clean` | Remove build artifacts |
| Generate ABI | `npm run gen:abi` | Export ABI for frontend |

### Frontend (frontend/ Directory)

| Script | Command | Description |
|--------|---------|-------------|
| Install | `npm install` | Install frontend dependencies |
| Dev | `npm run dev` | Start development server (localhost:5173) |
| Build | `npm run build` | Build for production |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Lint React/TypeScript code |

### Custom Hardhat Tasks

```bash
# List all accounts
npx hardhat accounts

# Get LegalDocs contract info
npx hardhat legaldocs:info --network sepolia

# Save a test document
npx hardhat legaldocs:save --network sepolia

# List documents for an address
npx hardhat legaldocs:list --address <ADDRESS> --network sepolia
```

## 🚧 Future Roadmap

### Phase 1: Enhanced Storage (Q2 2025)

- [ ] **IPFS Integration**: Decentralized storage for encrypted content
  - Replace IndexedDB with IPFS pinning
  - Content-addressed storage with hash verification
  - Persistent availability across devices

- [ ] **Arweave Support**: Permanent document archival
  - Long-term storage with pay-once model
  - Immutable historical records
  - Integration with Bundlr Network

### Phase 2: Advanced Features (Q3 2025)

- [ ] **File Upload Support**: Multi-format document handling
  - PDF, DOCX, images, and more
  - File type validation and sanitization
  - Chunked encryption for large files

- [ ] **Time-Locked Access**: Scheduled document availability
  - Set expiration dates for access
  - Automated revocation after timeouts
  - FHE-based time conditions

- [ ] **Multi-Signature Access**: Collaborative document control
  - Require multiple approvals for decryption
  - Threshold cryptography integration
  - Enterprise governance workflows

- [ ] **Document Versioning**: Track document history
  - Append-only version chains
  - Diff visualization between versions
  - Rollback capabilities

### Phase 3: Enterprise Features (Q4 2025)

- [ ] **Role-Based Access Control (RBAC)**: Organization-wide permissions
  - Define roles (viewer, editor, admin)
  - Hierarchical permission structures
  - Group-based access management

- [ ] **Audit Logging**: Comprehensive activity tracking
  - Immutable access logs
  - Export capabilities for compliance
  - Real-time monitoring dashboards

- [ ] **Document Templates**: Standardized legal forms
  - Pre-built contract templates
  - Variable substitution with FHE
  - Automated document generation

- [ ] **Mobile Application**: iOS and Android apps
  - React Native or Flutter implementation
  - Mobile wallet integration
  - Biometric authentication

### Phase 4: Cross-Chain & Interoperability (Q1 2026)

- [ ] **Multi-Chain Support**: Deploy on multiple networks
  - Polygon, Arbitrum, Optimism
  - Cross-chain document references
  - Unified access across chains

- [ ] **Web3 Identity Integration**: Decentralized identity (DID)
  - Ceramic Network integration
  - ENS domain support
  - Self-sovereign identity verification

- [ ] **Zero-Knowledge Proofs**: Enhanced privacy features
  - Prove document properties without revealing content
  - zk-SNARKs for compliance verification
  - Private metadata queries

### Phase 5: AI & Automation (Q2 2026)

- [ ] **FHE-Compatible AI Analysis**: Private document intelligence
  - Encrypted sentiment analysis
  - Contract clause detection
  - Risk assessment without decryption

- [ ] **Smart Contract Automation**: Programmable workflows
  - Conditional access based on events
  - Automated document lifecycle management
  - Integration with DeFi protocols

### Phase 6: Ecosystem & Standards (Q3 2026)

- [ ] **API & SDK**: Developer tools
  - REST API for integrations
  - JavaScript/TypeScript SDK
  - Webhook support for events

- [ ] **Standards Compliance**: Industry certifications
  - SOC 2 Type II audit preparation
  - GDPR compliance validation
  - Legal framework documentation

- [ ] **Plugin System**: Extensibility framework
  - Custom encryption modules
  - Third-party storage adapters
  - Integration marketplace

### Research & Exploration

- **Federated Learning on Encrypted Data**: Train models without decryption
- **Homomorphic Signatures**: Sign encrypted documents
- **Proxy Re-Encryption**: Delegate decryption rights without exposing keys
- **Quantum-Resistant Cryptography**: Future-proof security
- **Decentralized Oracles**: Automated compliance checks

### Community & Governance

- [ ] **DAO Formation**: Community-driven development
- [ ] **Bug Bounty Program**: Security audits and rewards
- [ ] **Educational Resources**: Tutorials, workshops, documentation
- [ ] **Open Source Contributions**: Welcome community PRs

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue on GitHub with detailed reproduction steps
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: Fix bugs or implement new features
4. **Improve Documentation**: Help make the docs clearer and more comprehensive
5. **Write Tests**: Increase test coverage for smart contracts and frontend
6. **Security Audits**: Review code for vulnerabilities

### Development Workflow

1. **Fork the Repository**: Click "Fork" on GitHub
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/yourusername/fhe-legal-document.git
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes**: Implement your feature or fix
5. **Run Tests**: Ensure all tests pass
   ```bash
   npm run test
   npm run lint
   ```
6. **Commit Changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push to Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open Pull Request**: Submit PR against `main` branch

### Code Style Guidelines

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint and Prettier configurations
- **React**: Follow React best practices and hooks guidelines
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/)

### Testing Requirements

All PRs must:
- Include tests for new features
- Maintain or improve existing test coverage
- Pass all existing tests
- Include integration tests for smart contract changes

## 🔒 Security

### Security Model

This project implements defense-in-depth security:

1. **Encryption Layers**:
   - Client-side AES-GCM encryption
   - FHE encryption for on-chain data
   - EIP-712 signature verification

2. **Access Controls**:
   - Wallet-based authentication
   - Smart contract permission enforcement
   - Cryptographic authorization proofs

3. **Data Integrity**:
   - SHA-256 content hashing
   - Blockchain immutability
   - Authenticated encryption (GCM mode)

### Known Limitations

1. **Browser Storage Vulnerability**:
   - Encrypted content in IndexedDB could be deleted by users
   - Mitigation: Implement IPFS backup in future releases

2. **Front-Running Risks**:
   - Public mempools may expose metadata before confirmation
   - Mitigation: Use private transaction relayers (Flashbots)

3. **Key Management**:
   - Users responsible for wallet security
   - Lost wallet = lost access to documents
   - Mitigation: Implement social recovery mechanisms

### Reporting Security Issues

**Please do not open public issues for security vulnerabilities.**

Instead, email security concerns to: [your-security-email@example.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fixes (if any)

We aim to respond within 48 hours and will keep you updated on remediation progress.

### Security Audits

- **Status**: Not yet audited
- **Planned**: Professional smart contract audit before mainnet deployment
- **Scope**: Smart contracts, cryptographic implementations, access control

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points:

- ✅ **Permitted**: Commercial use, modification, distribution, private use
- ❌ **Forbidden**: Patent use claims, trademark use, liability claims
- 📋 **Required**: License and copyright notice, state changes disclosure

See the [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

This project uses open-source dependencies with the following licenses:

- **FHEVM**: BSD-3-Clause-Clear (Zama)
- **Hardhat**: MIT License
- **React**: MIT License
- **Ethers.js**: MIT License

Full attribution available in `package.json` dependencies.

## 🙏 Acknowledgments

- **Zama**: For pioneering FHEVM technology and providing the FHE infrastructure
- **Hardhat Team**: For the excellent Ethereum development environment
- **OpenZeppelin**: For secure smart contract standards and best practices
- **RainbowKit**: For seamless wallet connection UX
- **Ethereum Foundation**: For the underlying blockchain platform

## 📞 Support & Community

### Documentation

- **Zama FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Guides**: [https://hardhat.org/getting-started](https://hardhat.org/getting-started)
- **Wagmi Documentation**: [https://wagmi.sh](https://wagmi.sh)

### Get Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/fhe-legal-document/issues)
- **Discussions**: [Join community discussions](https://github.com/yourusername/fhe-legal-document/discussions)
- **Zama Discord**: [https://discord.gg/zama](https://discord.gg/zama)

### Stay Updated

- **Twitter**: [@YourProjectHandle](https://twitter.com/yourhandle)
- **Blog**: [Project updates and tutorials](https://yourblog.com)
- **Newsletter**: [Subscribe for monthly updates](https://newsletter.yourproject.com)

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐ on GitHub!

Star history helps us understand community interest and motivates continued development.

---

**Built with ❤️ using Fully Homomorphic Encryption**

*Empowering privacy-preserving document management on the blockchain*

## 📊 Quick Stats

- **Language**: Solidity, TypeScript, React
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Encryption**: FHE (Fully Homomorphic Encryption) + AES-GCM
- **License**: BSD-3-Clause-Clear
- **Status**: Active Development 🚀

---

## FAQ

### Q: What happens if I lose my wallet's private key?
**A:** Unfortunately, access to your documents is cryptographically tied to your wallet. Without the private key, documents cannot be decrypted. We recommend using hardware wallets and maintaining secure backups of your seed phrase.

### Q: Can the smart contract owner access my documents?
**A:** No. Documents are encrypted client-side, and the smart contract only stores FHE-encrypted keys. Even the contract owner cannot decrypt your documents without your explicit permission.

### Q: How much does it cost to use?
**A:** Gas fees are required for blockchain transactions (saving documents, granting access). On Sepolia testnet, this is free using testnet ETH. Mainnet deployment would incur real ETH gas costs.

### Q: Is this production-ready?
**A:** Currently, this is a proof-of-concept and should be considered experimental. Professional security audits are required before production use with sensitive documents.

### Q: What about regulatory compliance (GDPR, HIPAA)?
**A:** The architecture supports compliance principles (data sovereignty, access control, audit trails), but legal review is necessary before using for regulated data.

### Q: Can I run this on a private blockchain?
**A:** Yes! The Hardhat configuration supports custom networks. You can deploy to private Ethereum networks or EVM-compatible chains.

### Q: How does this compare to traditional encrypted cloud storage?
**A:** Unlike cloud services, this solution is decentralized (no single point of failure), provides cryptographic access control (not just authentication), and ensures even the storage provider cannot access your data.

### Q: What's the maximum document size?
**A:** Currently limited by browser IndexedDB storage (typically 50MB+). Future IPFS integration will support much larger files.

---

**Last Updated**: January 2025
**Version**: 0.1.0
**Status**: Beta - Testnet Only
