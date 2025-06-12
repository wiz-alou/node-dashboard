import fs from 'fs/promises';
import path from 'path';
import { ethers } from 'ethers';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GenesisGenerator {
  constructor() {
    // Configuration des 5 nœuds
    this.validators = ['alice', 'bob', 'cassandra'];  // Qui peut créer des blocs
    this.fullNodes = ['driss', 'elena'];             // Qui stocke les données
    this.allNodes = [...this.validators, ...this.fullNodes];
    this.accounts = {};
  }

  // Générer un compte Ethereum pour chaque nœud
  async generateAccounts() {
    console.log(chalk.blue('🔑 Generating Ethereum accounts...'));
    
    for (const nodeName of this.allNodes) {
      // Créer un wallet aléatoire
      const wallet = ethers.Wallet.createRandom();
      
      this.accounts[nodeName] = {
        name: nodeName,
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey
      };
      
      console.log(chalk.green(`✅ ${nodeName}: ${wallet.address}`));
    }
    
    return this.accounts;
  }

  // Créer le fichier genesis.json pour Clique consensus
  async generateGenesis() {
    await this.generateAccounts();
    
    console.log(chalk.blue('⚙️ Creating Genesis configuration...'));
    
    // Prendre les adresses des validateurs pour Clique
    const validatorAddresses = this.validators
      .map(name => this.accounts[name].address.slice(2).toLowerCase())
      .join('');

    const genesis = {
      config: {
        chainId: 1337,                    // Notre réseau privé
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        istanbulBlock: 0,
        berlinBlock: 0,
        londonBlock: 0,
        clique: {                         // Consensus Proof of Authority
          period: 5,                      // Nouveau bloc toutes les 5 secondes
          epoch: 30000
        }
      },
      difficulty: "0x1",
      gasLimit: "0x8000000",              // Limite de gas par bloc
      extraData: "0x" + "0".repeat(64) + validatorAddresses + "0".repeat(130),
      alloc: {}                           // Comptes avec ETH initial
    };

    // Donner de l'ETH initial aux validateurs
    this.validators.forEach(nodeName => {
      const address = this.accounts[nodeName].address;
      genesis.alloc[address.toLowerCase()] = {
        balance: "0x200000000000000000000"  // 10000 ETH
      };
    });

    // Sauvegarder les fichiers
    await this.saveGenesis(genesis);
    await this.saveAccounts();
    
    console.log(chalk.green('✅ Genesis configuration created!'));
    return genesis;
  }

  // Sauvegarder genesis.json
  async saveGenesis(genesis) {
    const genesisPath = path.join(__dirname, '../../docker/genesis.json');
    await fs.writeFile(genesisPath, JSON.stringify(genesis, null, 2));
    console.log(chalk.cyan(`📁 Genesis saved: ${genesisPath}`));
  }

  // Sauvegarder accounts.json
  async saveAccounts() {
    const accountsPath = path.join(__dirname, '../../docker/accounts.json');
    await fs.writeFile(accountsPath, JSON.stringify(this.accounts, null, 2));
    console.log(chalk.cyan(`📁 Accounts saved: ${accountsPath}`));
  }
}

// Fonction pour tester directement
async function testGenesis() {
  console.log(chalk.yellow('🧪 Testing Genesis generation...'));
  const generator = new GenesisGenerator();
  await generator.generateGenesis();
  console.log(chalk.green('✅ Test completed!'));
}

// Permettre d'exécuter directement ce fichier
if (import.meta.url === `file://${process.argv[1]}`) {
  testGenesis().catch(console.error);
}

export default GenesisGenerator;