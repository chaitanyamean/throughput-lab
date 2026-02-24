// benchmark.js
const { benchmarkBullMQ }   = require('./runners/bullmq-runner');
const { benchmarkRabbitMQ } = require('./runners/rabbitmq-runner');
const { benchmarkKafka }    = require('./runners/kafka-runner');
const chalk = require('chalk');
const fs = require('fs');

// 10k → 100k → 1M → 10M
const SCALES = [10_000, 100_000, 1_000_000, 10_000_000];

const results = [];

async function run() {
  console.log(chalk.bold('\n📊 Message Queue Throughput Benchmark\n'));
  console.log('Scale'.padEnd(12), 'BullMQ'.padEnd(18), 'RabbitMQ'.padEnd(18), 'Kafka');
  console.log('─'.repeat(65));

  for (const count of SCALES) {
    const row = { count };

    try { row.bullmq    = await benchmarkBullMQ(count);    } catch(e) { row.bullmq    = 'BROKE'; }
    try { row.rabbitmq  = await benchmarkRabbitMQ(count);  } catch(e) { row.rabbitmq  = 'BROKE'; }
    try { row.kafka     = await benchmarkKafka(count);     } catch(e) { row.kafka     = 'BROKE'; }

    const fmt = (v) => typeof v === 'number'
      ? chalk.green(`${v.toLocaleString()} /s`)
      : chalk.red(v);

    console.log(
      `${count.toLocaleString()}`.padEnd(12),
      fmt(row.bullmq).padEnd(28),
      fmt(row.rabbitmq).padEnd(28),
      fmt(row.kafka)
    );

    results.push(row);
  }

  console.log('\n✅ Done. Full results:', JSON.stringify(results, null, 2));

  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to results.json');
}

run().catch(console.error);