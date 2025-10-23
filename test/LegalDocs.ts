import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { LegalDocs, LegalDocs__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("LegalDocs")) as LegalDocs__factory;
  const contract = (await factory.deploy()) as LegalDocs;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("LegalDocs", function () {
  let signers: Signers;
  let contract: LegalDocs;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { owner: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    ({ contract, address: contractAddress } = await deployFixture());
  });

  it("saves and lists documents", async function () {
    const docId = 1n;
    const name = "Agreement.pdf";
    const hash = "fakeHash123";

    const enc = await fhevm.createEncryptedInput(contractAddress, signers.owner.address).add256(123n).encrypt();

    await (await contract.connect(signers.owner).saveDocument(docId, name, hash, enc.handles[0], enc.inputProof)).wait();

    const metas = await contract.listDocuments(signers.owner.address);
    expect(metas.length).to.eq(1);
    expect(metas[0].name).to.eq(name);
    expect(metas[0].ipfsHash).to.eq(hash);

    const ids = await contract.listDocumentIds(signers.owner.address);
    expect(ids.length).to.eq(1);
    expect(ids[0]).to.eq(docId);

    const handle = await contract.getSecret(signers.owner.address, docId);
    expect(handle).to.not.eq(ethers.ZeroHash);

    const clear = await fhevm.userDecryptEuint(FhevmType.euint256, handle, contractAddress, signers.owner);
    expect(clear).to.eq(123n);
  });

  it("allows another address to decrypt", async function () {
    const docId = 2n;
    const enc = await fhevm.createEncryptedInput(contractAddress, signers.owner.address).add256(555n).encrypt();
    await (await contract.connect(signers.owner).saveDocument(docId, "doc", "hash", enc.handles[0], enc.inputProof)).wait();

    await (await contract.connect(signers.owner).allowSecret(docId, signers.bob.address)).wait();

    const handle = await contract.getSecret(signers.owner.address, docId);
    const clearForBob = await fhevm.userDecryptEuint(FhevmType.euint256, handle, contractAddress, signers.bob);
    expect(clearForBob).to.eq(555n);
  });
});
