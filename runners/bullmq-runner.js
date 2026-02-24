// runners/bullmq-runner.js
const { Queue } = require('bullmq');

async function benchmarkBullMQ(count) {
  const queue = new Queue('benchmark', {
    connection: { host: 'localhost', port: 6379 }
  });

  const payload = { data: 'x'.repeat(100) }; // ~100 byte payload
  const batch   = 1000; // add in batches for realism

  const start = Date.now();

  for (let i = 0; i < count; i += batch) {
    const jobs = Array.from({ length: Math.min(batch, count - i) }, (_, j) => ({
      name: 'event',
      data: { ...payload, id: i + j }
    }));
    await queue.addBulk(jobs);
  }

  const elapsed = (Date.now() - start) / 1000;
  await queue.obliterate({ force: true }); // cleanup
  await queue.close();

  return Math.round(count / elapsed);
}

module.exports = { benchmarkBullMQ };