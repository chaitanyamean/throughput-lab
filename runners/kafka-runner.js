// runners/kafka-runner.js
const { Kafka } = require('kafkajs');

async function benchmarkKafka(count) {
  const kafka    = new Kafka({ clientId: 'benchmark', brokers: ['localhost:9092'] });
  const producer = kafka.producer({
    // KEY PERF KNOBS ↓
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
    batch: {
      size: 16384,       // 16KB batch
      lingerMs: 5,       // wait up to 5ms to fill batch
    }
  });

  await producer.connect();

  const payload  = JSON.stringify({ data: 'x'.repeat(100) });
  const batchSz  = 500;
  const start    = Date.now();

  for (let i = 0; i < count; i += batchSz) {
    const messages = Array.from(
      { length: Math.min(batchSz, count - i) },
      (_, j) => ({ value: payload, key: String(i + j) })
    );
    await producer.send({ topic: 'benchmark', messages });
  }

  const elapsed = (Date.now() - start) / 1000;
  await producer.disconnect();

  return Math.round(count / elapsed);
}

module.exports = { benchmarkKafka };