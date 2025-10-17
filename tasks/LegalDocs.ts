import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("docs:address", "Prints the LegalDocs address").setAction(async function (_args: TaskArguments, hre) {
  const { deployments } = hre;
  const d = await deployments.get("LegalDocs");
  console.log("LegalDocs address is " + d.address);
});

task("docs:save", "Save a legal document metadata + secret")
  .addParam("id", "Document id (uint256)")
  .addParam("name", "Document name")
  .addParam("hash", "IPFS hash")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const d = await deployments.get("LegalDocs");
    const [signer] = await ethers.getSigners();
    const c = await ethers.getContractAt("LegalDocs", d.address);

    const input = await fhevm.createEncryptedInput(d.address, signer.address).add256(BigInt("0x" + crypto.randomUUID().replace(/-/g, "").padEnd(64, "0")) ).encrypt();

    const tx = await c.connect(signer).saveDocument(
      BigInt(args.id),
      args.name,
      args.hash,
      input.handles[0],
      input.inputProof
    );
    console.log(`Wait for tx:${tx.hash}...`);
    await tx.wait();
    console.log("Saved.");
  });

