#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

// Configuration CLI
program
  .name('benchy')
  .description('🏢 Ethereum network dashboard and benchmarking tool')
  .version('1.0.0');

// Commande 1: Launch Network
program
  .command('launch-network')
  .description('🚀 Deploy a private Ethereum network with 5 nodes')
  .action(async () => {
    try {
      const { default: launchNetwork } = await import('../src/commands/launch-network.js');
      await launchNetwork();
    } catch (error) {
      console.error(chalk.red('❌ Error launching network:'), error.message);
      process.exit(1);
    }
  });

// Commande 2: Infos
program
  .command('infos')
  .description('📊 Display information about network nodes')
  .option('-u, --update <seconds>', 'Update interval in seconds')
  .action(async (options) => {
    console.log(chalk.green('📊 Network information:'));
    if (options.update) {
      console.log(chalk.cyan(`🔄 Auto-update every ${options.update} seconds`));
    }
    console.log(chalk.yellow('⚠️  Implementation coming next...'));
  });

// Commande 3: Scenario
program
  .command('scenario <number>')
  .description('🎭 Run test scenario (0, 1, 2, or 3)')
  .action(async (number) => {
    console.log(chalk.magenta(`🎭 Running scenario ${number}...`));
    
    // Validation du numéro de scénario
    const validScenarios = ['0', '1', '2', '3'];
    if (!validScenarios.includes(number)) {
      console.log(chalk.red('❌ Invalid scenario number. Use 0, 1, 2, or 3'));
      return;
    }
    
    console.log(chalk.yellow('⚠️  Implementation coming next...'));
  });

// Commande 4: Temporary Failure
program
  .command('temporary-failure <node>')
  .description('💥 Simulate node failure for 40 seconds')
  .action(async (node) => {
    const validNodes = ['alice', 'bob', 'cassandra', 'driss', 'elena'];
    
    if (!validNodes.includes(node.toLowerCase())) {
      console.log(chalk.red('❌ Invalid node name. Use: alice, bob, cassandra, driss, or elena'));
      return;
    }
    
    console.log(chalk.red(`💥 Simulating failure for ${node}...`));
    console.log(chalk.yellow('⚠️  Implementation coming next...'));
  });

// Help command personnalisé
program
  .command('help-full')
  .description('🆘 Show detailed help and examples')
  .action(() => {
    console.log(chalk.cyan('\n🏢 BENCHY - Ethereum Network Benchmarking Tool\n'));
    
    console.log(chalk.yellow('📋 COMMANDS:'));
    console.log('  launch-network              🚀 Deploy private Ethereum network');
    console.log('  infos                       📊 Show network status');
    console.log('  scenario <0|1|2|3>          🎭 Run test scenarios');
    console.log('  temporary-failure <node>    💥 Simulate node failure');
    
    console.log(chalk.yellow('\n💡 EXAMPLES:'));
    console.log('  benchy launch-network       # Start the network');
    console.log('  benchy infos                # Check network status');
    console.log('  benchy infos -u 30          # Monitor every 30 seconds');
    console.log('  benchy scenario 1           # Run transfer scenario');
    console.log('  benchy temporary-failure alice  # Simulate Alice failure');
    
    console.log(chalk.yellow('\n🏗️ NETWORK NODES:'));
    console.log('  alice      - Geth validator      (Port 8545)');
    console.log('  bob        - Nethermind validator (Port 8547)');
    console.log('  cassandra  - Geth validator      (Port 8549)');
    console.log('  driss      - Nethermind full     (Port 8551)');
    console.log('  elena      - Geth full           (Port 8553)');
  });

// Lancer le CLI
program.parse();