export const legalDocsAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "uint256", name: "docId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "ipfsHash", type: "string" },
      { indexed: false, internalType: "uint256", name: "savedAt", type: "uint256" }
    ],
    name: "DocumentSaved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "uint256", name: "docId", type: "uint256" }
    ],
    name: "SecretAllowed",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "docId", type: "uint256" },
      { internalType: "address", name: "allowedAddr", type: "address" }
    ],
    name: "allowSecret",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "docId", type: "uint256" }
    ],
    name: "getSecret",
    outputs: [
      { internalType: "euint256", name: "", type: "bytes32" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" }
    ],
    name: "listDocumentIds",
    outputs: [
      { internalType: "uint256[]", name: "", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" }
    ],
    name: "listDocuments",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "ipfsHash", type: "string" },
          { internalType: "uint256", name: "savedAt", type: "uint256" }
        ],
        internalType: "struct LegalDocs.DocMeta[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "protocolId",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "docId", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "externalEuint256", name: "secretHandle", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" }
    ],
    name: "saveDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const legalDocsAddress = "0x3795e195D3Ce3ae2F74B14295585134a5A5642A1" as const;
