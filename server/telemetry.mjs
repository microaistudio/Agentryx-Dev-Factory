import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4401;
const clients = new Set();
let mockInterval = null;

function getInitialState() {
  return {
    agents: [
      { id: 'jane', name: 'Jane', role: 'PM / Triage', model: 'gemini-2.5-flash', status: 'idle', cssClass: 'jane', room: 0 },
      { id: 'spock', name: 'Spock', role: 'Auto-Research', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'spock', room: 1 },
      { id: 'torres', name: 'Torres', role: 'Junior Dev', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'torres', room: 2 },
      { id: 'data', name: 'Data', role: 'Sr. Architect', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'data', room: 2 },
      { id: 'tuvok', name: 'Tuvok', role: 'QA Reviewer', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'tuvok', room: 3 },
      { id: 'obrien', name: "O'Brien", role: 'SRE / Deploy', model: 'gemini-2.5-flash', status: 'idle', cssClass: 'obrien', room: 5 }
    ],
    logs: [],
    workItems: [],
    completedItems: [] // Modules successfully through the pipeline
  };
}

let currentState = getInitialState();

function broadcast() {
  const data = `data: ${JSON.stringify(currentState)}\n\n`;
  for (const client of clients) client.write(data);
}

function addLog(agentId, message) {
  currentState.logs.unshift({
    time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'}),
    agent: agentId || 'system',
    agentLabel: currentState.agents.find(a => a.id === agentId)?.name || 'System',
    message: message
  });
  if (currentState.logs.length > 50) currentState.logs.pop();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runSimulationLoop() {
  if (mockInterval) return;
  currentState = getInitialState();
  mockInterval = true;
  
  const t1 = { id: 'PR-101', name: 'UI Update', color: '#60a5fa' };
  const t2 = { id: 'BUG-40', name: 'Auth Fix', color: '#fb923c' };
  const t3 = { id: 'FEAT-9', name: 'Payments', color: '#c084fc' };
  
  const flow = [
    // Step 1: T1 enters Backlog
    async () => {
      currentState.workItems.push({ ...t1, room: 0 }); // Backlog
      currentState.agents.find(a=>a.id==='jane').status = 'working';
      addLog('jane', `Ingesting ${t1.id} into Backlog.`);
    },
    // Step 2: T1 to Build, T2 enters Backlog
    async () => {
      currentState.workItems.find(w=>w.id===t1.id).room = 2; // Build
      currentState.workItems.push({ ...t2, room: 0 });
      currentState.agents.find(a=>a.id==='torres').room = 2;
      currentState.agents.find(a=>a.id==='torres').status = 'working';
      addLog('torres', `Started dev on ${t1.id}.`);
      addLog('jane', `Triaging new ticket ${t2.id}.`);
    },
    // Step 3: T1 to QA, T2 to Build, T3 enters Backlog
    async () => {
      currentState.workItems.find(w=>w.id===t1.id).room = 3; // QA
      currentState.workItems.find(w=>w.id===t2.id).room = 2; // Build
      currentState.workItems.push({ ...t3, room: 0 });
      currentState.agents.find(a=>a.id==='jane').status = 'idle';
      currentState.agents.find(a=>a.id==='tuvok').status = 'working';
      currentState.agents.find(a=>a.id==='data').room = 2;
      currentState.agents.find(a=>a.id==='data').status = 'working';
      addLog('tuvok', `Testing ${t1.id} logic.`);
      addLog('data', `Jumping in to build ${t2.id}.`);
    },
    // Step 4: T1 to Review, T2 to QA, T3 to Build
    async () => {
      currentState.workItems.find(w=>w.id===t1.id).room = 4; // Review
      currentState.workItems.find(w=>w.id===t2.id).room = 3; // QA
      currentState.workItems.find(w=>w.id===t3.id).room = 2; // Build
      currentState.agents.find(a=>a.id==='data').room = 4; // Data reviews
      addLog('data', `Reviewing ${t1.id} PR.`);
      addLog('tuvok', `Testing ${t2.id} edge cases.`);
      addLog('torres', `Starting ${t3.id} architecture.`);
    },
    // Step 5: T1 to Ship, T2 to Review, T3 to QA
    async () => {
      currentState.workItems.find(w=>w.id===t1.id).room = 5; // Ship
      currentState.workItems.find(w=>w.id===t2.id).room = 4; // Review
      currentState.workItems.find(w=>w.id===t3.id).room = 3; // QA
      currentState.agents.find(a=>a.id==='obrien').status = 'working';
      currentState.agents.find(a=>a.id==='jane').room = 4; // PM reviews
      currentState.agents.find(a=>a.id==='jane').status = 'working';
      addLog('obrien', `Deploying ${t1.id} to production.`);
      addLog('jane', `Reviewing rushed ${t2.id}...`);
      addLog('tuvok', `QA passed for ${t3.id}...`);
    },
    // Step 6: T1 done, T2 to Ship, T3 to Review
    async () => {
      currentState.workItems = currentState.workItems.filter(w=>w.id!==t1.id);
      currentState.completedItems.unshift({ ...t1, status: 'Live', time: new Date().toLocaleTimeString() });
      currentState.workItems.find(w=>w.id===t2.id).room = 5;
      currentState.workItems.find(w=>w.id===t3.id).room = 4;
      currentState.agents.find(a=>a.id==='data').room = 4; // Data reviews t3
      addLog('obrien', `Deploying ${t2.id} to production.`);
      addLog('system', `${t1.id} successfully shipped!`);
    },
    // Step 7: T2 done, T3 to Ship
    async () => {
      currentState.workItems = currentState.workItems.filter(w=>w.id!==t2.id);
      currentState.completedItems.unshift({ ...t2, status: 'Live', time: new Date().toLocaleTimeString() });
      currentState.workItems.find(w=>w.id===t3.id).room = 5;
      currentState.agents.find(a=>a.id==='data').status = 'idle';
      currentState.agents.find(a=>a.id==='jane').status = 'idle';
      currentState.agents.find(a=>a.id==='tuvok').status = 'idle';
      currentState.agents.find(a=>a.id==='torres').status = 'idle';
      addLog('obrien', `Deploying ${t3.id} to production.`);
    },
    // Step 8: Complete
    async () => {
      currentState.workItems = [];
      currentState.completedItems.unshift({ ...t3, status: 'Live', time: new Date().toLocaleTimeString() });
      currentState.agents.forEach(a => a.status = 'idle');
      addLog('system', `All batches deployed. Pipeline clear.`);
    }
  ];

  for (const step of flow) {
    await step();
    broadcast();
    await sleep(4000);
  }

  mockInterval = null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  if (req.url === '/api/telemetry/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify(currentState)}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Trigger Mock Pipeline
  if (req.url === '/api/telemetry/simulate' && req.method === 'POST') {
    runSimulationLoop(); // async background loop
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Simulation Pipeline Started' }));
    return;
  }

  // Save Config from UI
  if (req.url === '/api/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const config = JSON.parse(body);
        let envContent = '';
        if (config.github) envContent += `GITHUB_PAT=${config.github}\n`;
        if (config.perplexity) envContent += `PERPLEXITY_API_KEY=${config.perplexity}\n`;
        if (config.whatsappWebhook) envContent += `WHATSAPP_WEBHOOK=${config.whatsappWebhook}\n`;
        
        fs.writeFileSync(path.join(process.cwd(), '.env.factory'), envContent);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400); res.end(JSON.stringify({ error: err.message }));
      }
    }); return;
  }

  // Test Connectivity API
  if (req.url === '/api/test-connection' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const config = JSON.parse(body);
        let githubStatus = 'untested';
        let perplexityStatus = 'untested';

        if (config.github) {
          try {
            const ghRes = await fetch('https://api.github.com/user', {
              headers: { 'Authorization': `token ${config.github}`, 'User-Agent': 'Agentryx-Factory' }
            });
            githubStatus = ghRes.ok ? 'success' : 'error';
          } catch(e) { githubStatus = 'error'; }
        }

        if (config.perplexity) {
          try {
            const pRes = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${config.perplexity}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'sonar', messages: [{role: 'user', content: 'test'}] })
            });
            perplexityStatus = pRes.ok ? 'success' : 'error';
          } catch(e) { perplexityStatus = 'error'; }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ github: githubStatus, perplexity: perplexityStatus }));
      } catch (err) {
        res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
      }
    }); return;
  }

  // Remote agent states
  if (req.url === '/api/telemetry/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        if (update.agentId) {
            const agent = currentState.agents.find(a => a.id === update.agentId);
            if (agent) {
                if (update.room !== undefined) agent.room = update.room;
                if (update.status !== undefined) agent.status = update.status;
            }
        }
        if (update.log) addLog(update.agentId, update.log);
        broadcast();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400); res.end(JSON.stringify({ error: err.message }));
      }
    }); return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, '0.0.0.0', () => console.log(`📡 Telemetry running on :${PORT}`));
