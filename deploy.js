require("dotenv").config();
const {
  Client,
  ContractCreateTransaction,
  FileCreateTransaction,
  Hbar,
  ContractFunctionParameters,
  PrivateKey,
} = require("@hashgraph/sdk");
const fs = require("fs");

// Load credentials
const operatorId = process.env.OPERATOR_ID;
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const contractJson = JSON.parse(
  fs.readFileSync("./out/RiskPool.sol/RiskPool.json", "utf8")
);

// The compiled bytecode is here:
const bytecode = contractJson.bytecode;

// DEPLOY CONTRACT
async function main() {
  // 1. Upload bytecode as file
  const fileTx = new FileCreateTransaction()
    .setKeys([operatorKey.publicKey])
    .setContents(bytecode)
    .setMaxTransactionFee(new Hbar(2));
  const fileResponse = await fileTx.execute(client);
  const fileReceipt = await fileResponse.getReceipt(client);
  const bytecodeFileId = fileReceipt.fileId;
  console.log(`Bytecode file uploaded: ${bytecodeFileId}`);

  // 2. Create contract from bytecode file
  const contractTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(100_000)
    .setConstructorParameters(
      new ContractFunctionParameters() // Optional
    );
  const contractResponse = await contractTx.execute(client);
  const contractReceipt = await contractResponse.getReceipt(client);
  const contractId = contractReceipt.contractId;

  console.log(`✅ Contract deployed at: ${contractId}`);
}

main().catch(console.error);
