#!/usr/bin/env node
/**
 * x402 Payment Server — HTTP 402 + USDC on-chain verification
 *
 * Protocol: When a client requests a paid resource without payment,
 * the server responds with HTTP 402 and JSON payment instructions.
 * Client sends USDC on-chain, then retries with tx hash in header.
 * Server verifies on-chain and serves the content.
 *
 * Zero API keys. Zero accounts. Pure on-chain.
 *
 * Usage:
 *   node x402-server.js                  # Start on port 4020
 *   PORT=8080 node x402-server.js        # Custom port
 *   PRICE=5 node x402-server.js          # Custom USDC price
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Config ----
const PORT = parseInt(process.env.PORT || '4020', 10);
const PRICE_USDC = parseInt(process.env.PRICE || '10', 10);
const WALLET = process.env.WALLET || '0x6024AB6263AB33150C4Ab83E74733AD42fdD71C4';
const USDC_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // Arbitrum USDC
const RPC_URL = process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc';
const USDC_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// ---- Content Registry ----
// Map resource paths to file paths or static content
const STACKS_DIR = join(__dirname, 'stacks');
const CONTENT = {
  '/stacks/monorepo': { file: 'stacks/monorepo.zip', name: 'Monorepo Stack', size: '2.0KB' },
  '/stacks/microservices': { file: 'stacks/microservices.zip', name: 'Microservices Stack', size: '2.4KB' },
  '/stacks/fullstack-nextjs': { file: 'stacks/fullstack-nextjs.zip', name: 'Fullstack Next.js Stack', size: '3.3KB' },
  '/stacks/enterprise-python': { file: 'stacks/enterprise-python.zip', name: 'Enterprise Python Stack', size: '3.1KB' },
  '/stacks/team-sharing': { file: 'stacks/team-sharing.zip', name: 'Team Sharing Stack', size: '2.4KB' },
  '/stacks/ci-cd-integration': { file: 'stacks/ci-cd-integration.zip', name: 'CI/CD Integration Stack', size: '2.5KB' },
};

// ---- x402 Response Helpers ----

function paymentRequired(path, method = 'USDC') {
  return {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Method': method,
      'X-Price': String(PRICE_USDC),
      'X-Price-Currency': 'USDC',
      'X-Price-Chain': 'arbitrum',
      'X-Wallet-Address': WALLET,
    },
    body: JSON.stringify({
      error: 'Payment required',
      price: PRICE_USDC,
      currency: 'USDC',
      chain: 'arbitrum',
      wallet: WALLET,
      usdcAddress: USDC_ADDRESS,
      resource: path,
      howTo: {
        step1: `Send exactly ${PRICE_USDC} USDC to ${WALLET} on Arbitrum`,
        step2: 'Copy the transaction hash from your wallet',
        step3: `Retry this request with header: X-Tx-Hash: <your-tx-hash>`,
      },
      explorer: `https://arbiscan.io/address/${WALLET}`,
    }, null, 2),
  };
}

function successResponse(path, content) {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Status': 'verified',
    },
    body: JSON.stringify({
      success: true,
      resource: path,
      content: content || { message: 'Premium content unlocked' },
      downloadUrl: `https://github.com/ipythoning/aicfg/releases/latest/download/${path.split('/').pop()}.zip`,
    }, null, 2),
  };
}

async function serveZipFile(res, content) {
  const filePath = join(STACKS_DIR, content.file);
  try {
    const data = await readFile(filePath);
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${content.file}"`,
      'Content-Length': String(data.length),
      'X-Payment-Status': 'verified',
    };
    res.writeHead(200, headers);
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

// ---- On-Chain Verification ----

async function verifyPayment(txHash) {
  const resp = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    }),
  });

  const data = await resp.json();
  if (!data.result || data.result.status !== '0x1') return false;

  const receipt = data.result;
  const paddedWallet = '0x' + WALLET.slice(2).toLowerCase().padStart(64, '0');

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== USDC_ADDRESS.toLowerCase()) continue;
    if (log.topics[0] !== USDC_TRANSFER_TOPIC) continue;
    if (log.topics[2]?.toLowerCase() === paddedWallet.toLowerCase()) {
      const value = BigInt(log.data);
      const minWei = BigInt(PRICE_USDC * 1_000_000n);
      return value >= minWei;
    }
  }

  return false;
}

// ---- API Routes ----

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // Catalog endpoint — always free
  if (path === '/' || path === '/catalog') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'aicfg Pro x402 Payment Server',
      version: '0.1.0',
      price: PRICE_USDC,
      currency: 'USDC',
      chain: 'arbitrum',
      wallet: WALLET,
      resources: Object.entries(CONTENT).map(([p, c]) => ({
        path: p,
        name: c.name,
        size: c.size,
      })),
      usage: `Send ${PRICE_USDC} USDC to ${WALLET}, then GET /<resource> with header X-Tx-Hash: <your-tx>`,
    }, null, 2));
    return;
  }

  // Health check
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', chain: 'arbitrum', wallet: WALLET }));
    return;
  }

  // Payment verification endpoint
  if (path === '/verify' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const { txHash } = JSON.parse(body);
      if (!txHash) throw new Error('Missing txHash');

      const verified = await verifyPayment(txHash);
      res.writeHead(verified ? 200 : 402, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ verified, txHash }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Premium content endpoint
  const content = CONTENT[path];
  if (!content) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Resource not found', path, available: Object.keys(CONTENT) }));
    return;
  }

  // Check for payment
  const txHash = req.headers['x-tx-hash'];
  if (!txHash) {
    const resp = paymentRequired(path);
    res.writeHead(resp.status, resp.headers);
    res.end(resp.body);
    return;
  }

  // Verify payment
  const verified = await verifyPayment(txHash);
  if (!verified) {
    const resp = paymentRequired(path);
    resp.body = JSON.stringify({ ...JSON.parse(resp.body), detail: 'Transaction not found or insufficient payment. Check the tx hash and amount.' }, null, 2);
    res.writeHead(resp.status, resp.headers);
    res.end(resp.body);
    return;
  }

  // Payment verified — serve zip file (or JSON if zip not found)
  const zipServed = await serveZipFile(res, content);
  if (!zipServed) {
    const resp = successResponse(path, { name: content.name, size: content.size });
    res.writeHead(resp.status, resp.headers);
    res.end(resp.body);
  }

  console.log(`✓ Payment verified for ${path} — tx: ${txHash.slice(0, 10)}...`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ---- Start Server ----

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🔐 x402 Payment Server running on http://localhost:${PORT}`);
  console.log(`   Price: ${PRICE_USDC} USDC on Arbitrum`);
  console.log(`   Wallet: ${WALLET}`);
  console.log(`\n   Try: curl http://localhost:${PORT}/catalog`);
  console.log(`   Try: curl http://localhost:${PORT}/stacks/monorepo`);
  console.log(`   Pay:  Send ${PRICE_USDC} USDC to ${WALLET}`);
  console.log(`   Then: curl -H "X-Tx-Hash: <tx>" http://localhost:${PORT}/stacks/monorepo\n`);
});
