const fs = require('fs');
const solc = require('solc');
const TronWeb = require('TronWeb');
const config = require('../config/tron.json');

const CONTRACT_FOLDER = '../contracts/';


const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
const eventServer = 'https://api.shasta.trongrid.io/';

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, config.deploy_keys.testnet);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deploy() {
  const input = {};

  const files = fs.readdirSync(CONTRACT_FOLDER);
  files.map((file) => {
    input[file] = fs.readFileSync(CONTRACT_FOLDER + file, 'utf8').toString();
  });

  const output = {};

  console.log(`Compiling solidity...`);
  const compiled = solc.compile({sources: input}, 1);

  if (!compiled.errors) {
    for (let contractName in compiled.contracts) {
      // code and ABI that are needed by web3
      console.log(`deploying ${contractName}`);

      const unsigned = await tronWeb.transactionBuilder.createSmartContract({
        abi: compiled.contracts[contractName].interface,
        bytecode: compiled.contracts[contractName].bytecode,
      });
      const signed = await tronWeb.trx.sign(unsigned);
      const broadcastResult = await tronWeb.trx.sendRawTransaction(signed);

      if (broadcastResult.result === true) {
        let transactionInfo = {};
        do {
          transactionInfo = await tronWeb.trx.getTransactionInfo(signed.txID);
          if (transactionInfo.id && transactionInfo.receipt.result === 'SUCCESS') {
            if (transactionInfo.receipt.result) {
              console.log(`SUCCESSFULLY deployed ${contractName}. Cost: ${transactionInfo.receipt.energy_fee / 1000000} TRX.`);
              console.log(`Contract address: ${signed.contract_address}`);
              output[contractName] = signed.contract_address;
              output[contractName] = {
                address: signed.contract_address,
                abi: JSON.parse(compiled.contracts[contractName].interface)
              }
            } else {
              console.log(`FAILED deploying ${contractName}. Cost: ${transactionInfo.receipt.energy_fee / 1000000} TRX.`);
              console.log(`transaction info:`);
              console.log(transactionInfo);
              process.exit();
            }
          }
          await sleep(2000);
        } while (!transactionInfo.id);
      } else {
        console.log(`FAILED to broadcast ${contractName} deploy transaction`);
        console.log((broadcastResult));
        process.exit();
      }
    }

    fs.writeFileSync('../src/config/contracts.json', JSON.stringify(output, null, 4));
  } else {
    console.log(`FAILED to compile solidity...`);
    compiled.errors.map((e) => {
      console.log(e);
    });
  }
}

deploy();
