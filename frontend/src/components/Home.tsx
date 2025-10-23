import { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { ethers, Contract } from 'ethers';
import { legalDocsAbi, legalDocsAddress } from '../abi/legalDocs';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { aesGcmEncrypt, aesGcmDecrypt, sha256, hexlify, bigIntToBytes32 } from '../utils/crypto';
import { putCipher, getCipher } from '../utils/storage';

export function Home() {
  const { address, chain } = useAccount();
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docId, setDocId] = useState<number>(Date.now());
  const [allowAddr, setAllowAddr] = useState('');

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
    const signer = await provider.getSigner();

    if (!instance) { alert('Zama FHE instance not initialized'); return; }

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
    alert('Saved');
  };

  const handleAllow = async () => {
    if (!provider || !address) return;
    const normalizedDocId = BigInt(docId);
    if (!allowAddr) { alert('Enter address to allow'); return; }
    let targetAddr: string;
    try {
      targetAddr = ethers.getAddress(allowAddr);
    } catch (err) {
      alert('Invalid address');
      return;
    }
    const signer = await provider.getSigner();
    const c = new Contract(legalDocsAddress, legalDocsAbi as any, signer);
    const tx = await c.allowSecret(normalizedDocId, targetAddr);
    await tx.wait();
    alert('Allowed');
  };

  const handleDecrypt = async (owner: string, id: bigint, ipfsHash: string) => {
    if (!address || !instance || !provider) return;
    const signer = await provider.getSigner();
    // 1) Read ciphertext handle from contract
    // Use viem read via wagmi client
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
    if (!payload) { alert('Encrypted content not found in storage'); return; }
    const iv = payload.slice(0, 12);
    const ct = payload.slice(12);
    const pt = await aesGcmDecrypt(secretBytes, iv, ct);
    const text = new TextDecoder().decode(pt);
    alert(`Decrypted content for doc ${id}:\n\n${text}`);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Legal Documents</h2>
        <ConnectButton />
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Save New Document</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Document Name" value={docName} onChange={e=>setDocName(e.target.value)} />
          <textarea placeholder="Document content (will be sym-encrypted off-chain)" value={docContent} onChange={e=>setDocContent(e.target.value)} />
          <input placeholder="Document Id" value={docId} onChange={e=>setDocId(parseInt(e.target.value||'0'))} />
          <button onClick={handleEncryptAndSave}>Encrypt + Save</button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Your Documents</h3>
        {!address && <p>Connect wallet to view.</p>}
        {address && Array.isArray(docs) && (docs as any[]).length === 0 && <p>No documents yet.</p>}
        {address && Array.isArray(docs) && Array.isArray(docIds) && (docs as any[]).map((d: any, idx: number) => (
          <div key={idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div><strong>{d.name}</strong></div>
            <div>Hash: {d.ipfsHash}</div>
            <div>Saved: {new Date(Number(d.savedAt) * 1000).toLocaleString()}</div>
            <div>DocId: {(docIds as any[])[idx]?.toString?.() ?? ''}</div>
            <div>
              <button onClick={() => handleDecrypt(address, BigInt((docIds as any[])[idx]), d.ipfsHash)}>Decrypt</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Allow Decryption</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Doc Id" value={docId} onChange={e=>setDocId(parseInt(e.target.value||'0'))} />
          <input placeholder="Address to allow" value={allowAddr} onChange={e=>setAllowAddr(e.target.value)} />
          <button onClick={handleAllow}>Allow</button>
        </div>
      </div>
    </div>
  );
}
