// runners/rabbitmq-runner.js
const amqp = require('amqplib');

async function benchmarkRabbitMQ(count) {
  const conn    = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  const queue   = 'benchmark';

  await channel.assertQueue(queue, { durable: false });
  channel.purgeQueue(queue);

  // KEY PERF KNOBS ↓
  channel.prefetch(500);
  const payload = Buffer.from(JSON.stringify({ data: 'x'.repeat(100) }));

  const start = Date.now();

  for (let i = 0; i < count; i++) {
    // publish returns false when buffer full — handle backpressure
    const ok = channel.sendToQueue(queue, payload, { persistent: false });
    if (!ok) {
      await new Promise(res => channel.once('drain', res));
    }
  }

  const elapsed = (Date.now() - start) / 1000;
  await channel.purgeQueue(queue);
  await conn.close();

  return Math.round(count / elapsed);
}

module.exports = { benchmarkRabbitMQ };