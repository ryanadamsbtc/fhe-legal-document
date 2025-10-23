import { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { ethers, Contract } from 'ethers';
import { legalDocsAbi, legalDocsAddress } from '../abi/legalDocs';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { aesGcmEncrypt, aesGcmDecrypt, sha256, hexlify, bigIntToBytes32 } from '../utils/crypto';
import { putCipher, getCipher } from '../utils/storage';
import './Home.css';

export function Home() {
  const { address, chain } = useAccount();
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docId, setDocId] = useState<number>(Date.now());
  const [allowAddr, setAllowAddr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: docs } = useReadContract({
    address: legalDocsAddress as `0x${string}`,
    abi: legalDocsAbi as any,
    functionName: 'listDocuments',
    args: [address ?? ethers.ZeroAddress],
    query: { enabled: !!address }
  });

  const { data: docIds } = useReadContract({
    address: legalDocsAddress as `0x${string}`,
    abi: legalDocsAbi as any,
    functionName: 'listDocumentIds',
    args: [address ?? ethers.ZeroAddress],
    query: { enabled: !!address }
  });

  const publicClient = usePublicClient();

  const provider = useMemo(() => {
    if ((window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return undefined;
  }, [chain?.id]);

  const { instance } = useZamaInstance();

  const handleEncryptAndSave = async () => {
    if (!provider || !address) return;
    setIsLoading(true);
    try {
      const signer = await provider.getSigner();

      if (!instance) {
        alert('Zama FHE instance not initialized');
        return;
      }

      // 1) Generate random secret A (uint256 -> 32 bytes)
      const rand = crypto.getRandomValues(new Uint8Array(32));
      const secretBig = BigInt('0x' + Array.from(rand).map(b=>b.toString(16).padStart(2,'0')).join(''));

      // 2) Encrypt document content using AES-GCM with key=rand
      const encoder = new TextEncoder();
      const pt = encoder.encode(docContent);
      const { iv, ciphertext } = await aesGcmEncrypt(rand, pt);
      const payload = new Uint8Array(iv.length + ciphertext.length);
      payload.set(iv, 0);
      payload.set(ciphertext, iv.length);
      const hashBytes = await sha256(payload);
      const ipfsHash = hexlify(hashBytes);

      // Persist encrypted content in IndexedDB under ipfsHash
      await putCipher(ipfsHash, payload);

      // 3) Encrypt secretA for on-chain storage via Zama
      const input = await instance.createEncryptedInput(legalDocsAddress, address);
      input.add256(secretBig);
      const enc = await input.encrypt();

      const c = new Contract(legalDocsAddress, legalDocsAbi as any, signer);
      const tx = await c.saveDocument(BigInt(docId), docName, ipfsHash, enc.handles[0], enc.inputProof);
      await tx.wait();

      setDocName('');
      setDocContent('');
      setDocId(Date.now());
      alert('Document saved successfully!');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllow = async () => {
    if (!provider || !address) return;
    setIsLoading(true);
    try {
      const normalizedDocId = BigInt(docId);
      if (!allowAddr) {
        alert('Please enter an address to allow');
        return;
      }
      let targetAddr: string;
      try {
        targetAddr = ethers.getAddress(allowAddr);
      } catch (err) {
        alert('Invalid Ethereum address');
        return;
      }
      const signer = await provider.getSigner();
      const c = new Contract(legalDocsAddress, legalDocsAbi as any, signer);
      const tx = await c.allowSecret(normalizedDocId, targetAddr);
      await tx.wait();

      setAllowAddr('');
      alert('Access granted successfully!');
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async (owner: string, id: bigint, ipfsHash: string) => {
    if (!address || !instance || !provider) return;
    setIsLoading(true);
    try {
      const signer = await provider.getSigner();
      // 1) Read ciphertext handle from contract
      const handle = await publicClient!.readContract({
        address: legalDocsAddress as `0x${string}`,
        abi: legalDocsAbi as any,
        functionName: 'getSecret',
        args: [owner as `0x${string}`, id]
      });

      // 2) User decrypt via Zama relayer
      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const eip712 = instance.createEIP712(keypair.publicKey, [legalDocsAddress], startTimeStamp, durationDays);
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );
      const res = await instance.userDecrypt({
        keypair,
        signature,
        startTimeStamp,
        durationDays,
        handleContractPairs: [{ handle, contractAddress: legalDocsAddress }]
      });
      const decrypted = res[0];
      const secretBig = BigInt(decrypted);
      const secretBytes = bigIntToBytes32(secretBig);

      // 3) Load encrypted payload from IndexedDB by ipfsHash
      const payload = await getCipher(ipfsHash);
      if (!payload) {
        alert('Encrypted content not found in storage');
        return;
      }
      const iv = payload.slice(0, 12);
      const ct = payload.slice(12);
      const pt = await aesGcmDecrypt(secretBytes, iv, ct);
      const text = new TextDecoder().decode(pt);
      alert(`Decrypted content for document ${id}:\n\n${text}`);
    } catch (error) {
      console.error('Error decrypting document:', error);
      alert('Failed to decrypt document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                  <path d="M12 9h8M12 14h8M12 19h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="header-title">Legal Docs</h1>
                <p className="header-subtitle">Encrypted Document Storage</p>
              </div>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge badge-primary">
              <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              FHE Encrypted
            </span>
          </div>
          <h2 className="hero-title">Secure Legal Document Management</h2>
          <p className="hero-description">
            Store and manage legal documents with end-to-end encryption powered by Fully Homomorphic Encryption (FHE)
          </p>
        </section>

        {/* Save Document Section */}
        <section className="section card">
          <div className="section-header">
            <div className="section-icon gradient-primary">
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">Save New Document</h3>
              <p className="section-description">Encrypt and store your legal documents securely on-chain</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Document Name</label>
              <input
                className="input"
                placeholder="e.g., Contract Agreement 2025"
                value={docName}
                onChange={e=>setDocName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document Content</label>
              <textarea
                className="input textarea"
                placeholder="Enter your legal document content here. It will be encrypted using AES-GCM and FHE..."
                value={docContent}
                onChange={e=>setDocContent(e.target.value)}
                rows={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document ID</label>
              <input
                className="input"
                type="number"
                placeholder="Auto-generated timestamp"
                value={docId}
                onChange={e=>setDocId(parseInt(e.target.value||'0'))}
              />
              <p className="form-hint">Unique identifier for this document</p>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleEncryptAndSave}
              disabled={isLoading || !address || !docName || !docContent}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Encrypting...
                </>
              ) : (
                <>
                  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Encrypt & Save Document
                </>
              )}
            </button>
          </div>
        </section>

        {/* Documents List Section */}
        <section className="section card">
          <div className="section-header">
            <div className="section-icon gradient-accent">
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">Your Documents</h3>
              <p className="section-description">View and decrypt your stored documents</p>
            </div>
          </div>

          <div className="documents-list">
            {!address && (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="empty-text">Connect your wallet to view documents</p>
              </div>
            )}

            {address && Array.isArray(docs) && (docs as any[]).length === 0 && (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="empty-text">No documents yet</p>
                <p className="empty-subtext">Start by saving your first encrypted document above</p>
              </div>
            )}

            {address && Array.isArray(docs) && Array.isArray(docIds) && (docs as any[]).map((d: any, idx: number) => (
              <div key={idx} className="document-card animate-fade-in">
                <div className="document-header">
                  <div className="document-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="document-info">
                    <h4 className="document-name">{d.name}</h4>
                    <div className="document-meta">
                      <span className="meta-item">
                        <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(Number(d.savedAt) * 1000).toLocaleDateString()}
                      </span>
                      <span className="meta-item">
                        <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        ID: {(docIds as any[])[idx]?.toString?.() ?? ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="document-details">
                  <div className="detail-row">
                    <span className="detail-label">IPFS Hash</span>
                    <code className="detail-value">{d.ipfsHash.slice(0, 20)}...{d.ipfsHash.slice(-10)}</code>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-decrypt"
                  onClick={() => handleDecrypt(address, BigInt((docIds as any[])[idx]), d.ipfsHash)}
                  disabled={isLoading}
                >
                  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  Decrypt Document
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Allow Access Section */}
        <section className="section card">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">Grant Access</h3>
              <p className="section-description">Allow others to decrypt your documents</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Document ID</label>
              <input
                className="input"
                type="number"
                placeholder="Enter document ID"
                value={docId}
                onChange={e=>setDocId(parseInt(e.target.value||'0'))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ethereum Address</label>
              <input
                className="input"
                placeholder="0x..."
                value={allowAddr}
                onChange={e=>setAllowAddr(e.target.value)}
              />
              <p className="form-hint">Address of the user who will receive decryption access</p>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleAllow}
              disabled={isLoading || !address || !allowAddr}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Grant Access
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            Powered by <strong className="gradient-text">Zama FHE</strong> on Sepolia Network
          </p>
          <div className="footer-links">
            <a href="https://docs.zama.ai/" target="_blank" rel="noopener noreferrer" className="footer-link">
              Documentation
            </a>
            <span className="footer-divider">•</span>
            <a href={`https://sepolia.etherscan.io/address/${legalDocsAddress}`} target="_blank" rel="noopener noreferrer" className="footer-link">
              Contract
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
