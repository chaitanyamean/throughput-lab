# Message Queue Throughput Benchmark

A benchmarking tool that compares the throughput performance of three popular message queuing systems:

- **Apache Kafka** — Distributed event streaming platform
- **RabbitMQ** — Traditional message broker (AMQP)
- **BullMQ** — Redis-based job queue for Node.js

The benchmark measures how many messages each system can produce/publish per second across scales of 10K, 100K, 1M, and 10M messages.

## Results

| Scale | BullMQ (msg/s) | RabbitMQ (msg/s) | Kafka (msg/s) |
|-------|-----------------|-------------------|----------------|
| 10K | 28,571 | 107,527 | 138,889 |
| 100K | 61,013 | 163,132 | 161,031 |
| 1M | 63,633 | 134,264 | 133,404 |
| 10M | 60,260 | 126,860 | 132,017 |

Kafka and RabbitMQ deliver similar high throughput at scale, while BullMQ (Redis-backed) trails behind.

## Project Structure

```
.
├── benchmarker.js           # Main entry point — orchestrates all benchmarks
├── docker-compose.yml       # Infrastructure services (Kafka, RabbitMQ, Redis, Zookeeper)
├── package.json             # Dependencies
├── results.json             # Benchmark output
└── runners/
    ├── kafka-runner.js      # Kafka producer benchmark (batched, 500 msgs/batch)
    ├── rabbitmq-runner.js   # RabbitMQ publisher benchmark (backpressure-aware)
    └── bullmq-runner.js     # BullMQ bulk job benchmark (1000 msgs/batch)
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Docker](https://www.docker.com/) and Docker Compose

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd kafka
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the infrastructure services**

   ```bash
   docker-compose up -d
   ```

   This starts:
   | Service | Port | Description |
   |---------|------|-------------|
   | Redis | 6379 | Backend for BullMQ |
   | RabbitMQ | 5672 | AMQP broker |
   | RabbitMQ UI | 15672 | Management dashboard (guest/guest) |
   | Zookeeper | 2181 | Kafka coordination (internal) |
   | Kafka | 9092 | Kafka broker |

4. **Wait for services to be healthy** — Kafka may take 10-20 seconds to fully start after Zookeeper is ready.

## Running the Benchmark

```bash
node benchmarker.js
```

The benchmark will:
1. Iterate through each scale (10K, 100K, 1M, 10M messages)
2. Run each queue system sequentially and measure throughput
3. Print a formatted table to the console
4. Save results to `results.json`

## Stopping the Services

```bash
docker-compose down
```

## Tech Stack

- **kafkajs** — Kafka client for Node.js
- **amqplib** — RabbitMQ AMQP client
- **bullmq** / **ioredis** — Redis-based job queue
- **chalk** — Terminal output formatting
