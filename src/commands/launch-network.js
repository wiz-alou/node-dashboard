import GenesisGenerator from '../core/genesis.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import Web3 from 'web3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

async function launchNetwork() {
  const spinner = ora('🚀 Initializing Benchy network...').start();
  
  try {
    // ÉTAPE 1: Générer la configuration Genesis
    spinner.text = '🔑 Generating Genesis block and accounts...';
    const genesisGenerator = new GenesisGenerator();
    await genesisGenerator.generateGenesis();
    
    // ÉTAPE 2: Arrêter tout réseau existant
    spinner.text = '🧹 Cleaning previous network...';
    const dockerPath = path.join(__dirname, '../../docker');
    
    try {
      await execAsync('docker compose down -v', { cwd: dockerPath });
    } catch (error) {
      // Ignorer si rien à arrêter
    }
    
    // ÉTAPE 3: Démarrer les nouveaux conteneurs
    spinner.text = '🐳 Starting Docker containers...';
    await execAsync('docker compose up -d', { cwd: dockerPath });
    
    // ÉTAPE 4: Attendre que tous les nœuds soient prêts
    spinner.text = '⏳ Waiting for nodes to be ready...';
    await waitForNodesReady();
    
    // ÉTAPE 5: Vérifier la synchronisation
    spinner.text = '🔄 Checking network synchronization...';
    await checkNetworkSync();
    
    spinner.succeed(chalk.green('✅ Benchy network launched successfully!'));
    
    // Afficher les informations du réseau
    displayNetworkInfo();
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to launch network'));
    console.error(chalk.red('Error details:'), error.message);
    
    // Suggestions de debug
    console.log(chalk.yellow('\n🔧 Debug suggestions:'));
    console.log(chalk.white('• Check Docker is running: docker ps'));
    console.log(chalk.white('• Check logs: docker compose logs'));
    console.log(chalk.white('• Check ports: netstat -an | grep 854'));
    
    throw error;
  }
}

// Attendre que tous les nœuds RPC soient prêts
async function waitForNodesReady() {
  const nodes = [
    { name: 'Alice', port: 8545, client: 'Geth' },
    { name: 'Bob', port: 8547, client: 'Nethermind' },
    { name: 'Cassandra', port: 8549, client: 'Geth' },
    { name: 'Driss', port: 8551, client: 'Nethermind' },
    { name: 'Elena', port: 8553, client: 'Geth' }
  ];
  
  for (const node of nodes) {
    const web3 = new Web3(`http://localhost:${node.port}`);
    let retries = 30; // 30 secondes max par nœud
    
    while (retries > 0) {
      try {
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(chalk.green(`✓ ${node.name} (${node.client}) ready - Block #${blockNumber}`));
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`${node.name} failed to start after 30 seconds`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// Vérifier que tous les nœuds sont synchronisés
async function checkNetworkSync() {
  const ports = [8545, 8547, 8549, 8551, 8553];
  const blockNumbers = [];
  
  for (const port of ports) {
    const web3 = new Web3(`http://localhost:${port}`);
    try {
      const blockNumber = await web3.eth.getBlockNumber();
      blockNumbers.push(blockNumber);
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Could not get block number from port ${port}`));
      blockNumbers.push(0);
    }
  }
  
  const maxBlock = Math.max(...blockNumbers);
  const minBlock = Math.min(...blockNumbers);
  
  if (maxBlock - minBlock > 2) {
    console.log(chalk.yellow('⚠️ Nodes not fully synchronized yet, but should sync soon'));
  } else {
    console.log(chalk.green('✅ All nodes synchronized'));
  }
}

// Afficher les informations du réseau
function displayNetworkInfo() {
  console.log(chalk.cyan('\n📊 Network Information:'));
  console.log(chalk.white('• Network ID: 1337 (Private)'));
  console.log(chalk.white('• Consensus: Clique (Proof of Authority)'));
  console.log(chalk.white('• Block time: ~5 seconds'));
  console.log(chalk.white('• Validators: Alice, Bob, Cassandra'));
  console.log(chalk.white('• Full nodes: Driss, Elena'));
  
  console.log(chalk.cyan('\n🔗 RPC Endpoints:'));
  console.log(chalk.white('• Alice (Geth):       http://localhost:8545'));
  console.log(chalk.white('• Bob (Nethermind):   http://localhost:8547'));
  console.log(chalk.white('• Cassandra (Geth):   http://localhost:8549'));
  console.log(chalk.white('• Driss (Nethermind): http://localhost:8551'));
  console.log(chalk.white('• Elena (Geth):       http://localhost:8553'));
  
  console.log(chalk.cyan('\n💡 Next steps:'));
  console.log(chalk.white('• Monitor network: benchy infos'));
  console.log(chalk.white('• Run scenarios: benchy scenario 0'));
  console.log(chalk.white('• Test failure: benchy temporary-failure alice'));
}

export default launchNetwork;