// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, eaddress, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract LegalDocs is SepoliaConfig {
    struct DocMeta {
        string name;
        string ipfsHash;
        uint256 savedAt;
    }

    // owner => docId => meta
    mapping(address => mapping(uint256 => DocMeta)) private _docs;
    // owner => list of docIds
    mapping(address => uint256[]) private _docIds;
    // owner => docId => encrypted secret (A)
    mapping(address => mapping(uint256 => euint256)) private _secrets;
    // owner => docId => eaddress allowed address (optional)
    mapping(address => mapping(uint256 => eaddress)) private _allowed;

    event DocumentSaved(address indexed owner, uint256 indexed docId, string name, string ipfsHash, uint256 savedAt);
    event SecretAllowed(address indexed owner, uint256 indexed docId);

    function saveDocument(
        uint256 docId,
        string calldata name,
        string calldata ipfsHash,
        externalEuint256 secretHandle,
        bytes calldata inputProof
    ) external {
        euint256 encSecret = FHE.fromExternal(secretHandle, inputProof);
        _docs[msg.sender][docId] = DocMeta({name: name, ipfsHash: ipfsHash, savedAt: block.timestamp});
        _secrets[msg.sender][docId] = encSecret;
        _docIds[msg.sender].push(docId);

        FHE.allowThis(encSecret);
        FHE.allow(encSecret, msg.sender);

        emit DocumentSaved(msg.sender, docId, name, ipfsHash, block.timestamp);
    }

    function listDocuments(address owner) external view returns (DocMeta[] memory) {
        uint256[] memory ids = _docIds[owner];
        DocMeta[] memory arr = new DocMeta[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            arr[i] = _docs[owner][ids[i]];
        }
        return arr;
    }

    function listDocumentIds(address owner) external view returns (uint256[] memory) {
        return _docIds[owner];
    }

    function getSecret(address owner, uint256 docId) external view returns (euint256) {
        return _secrets[owner][docId];
    }

    function allowSecret(uint256 docId, address allowedAddr) external {
        eaddress encAddr = FHE.asEaddress(allowedAddr);
        _allowed[msg.sender][docId] = encAddr;

        euint256 sec = _secrets[msg.sender][docId];
        if (FHE.isInitialized(sec)) {
            FHE.allow(sec, allowedAddr);
        }

        emit SecretAllowed(msg.sender, docId);
    }
}
