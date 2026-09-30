import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client with telemetry header as specified in skill guidelines
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI incident / schema reasoning endpoint
app.post('/api/explain', async (req, res) => {
  const { question, incidentContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // If Gemini API is available, call gemini-3.8-flash
  if (aiClient) {
    try {
      const prompt = `You are the lead AI Infrastructure Reliability & Safety Engineer for a Digital Public Infrastructure (DPI) API Gateway Swarm.
Answer the operator's query about the current simulated incident or schema failure.

CURRENT SYSTEM INCIDENT CONTEXT:
${JSON.stringify(incidentContext || {}, null, 2)}

OPERATOR QUESTION:
"${question}"

Provide a crisp, technically authoritative explanation (2 to 4 paragraphs or bullet points).
Focus on:
1. Root cause (API contract mismatch, field rename, data violation, or missing field).
2. The specific safety invariants that apply (Financial Value Conservation, Currency Conservation, Sensitive Data Preservation, No Field Injection, Schema Completeness, Deterministic Mapping).
3. Why the action taken (adapter synthesized, verified, deployed, or blocked) was correct for financial integrity.
Keep the tone professional, like a senior infrastructure architect reporting to a central bank or fintech audit committee.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        answer: response.text || 'No response generated from Gemini.',
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic engine:', err?.message || err);
      // Fall through to deterministic fallback
    }
  }

  // Deterministic context-aware reasoning engine for offline/demo reliability
  const fallbackAnswer = generateDeterministicExplanation(question, incidentContext);
  return res.json({
    answer: fallbackAnswer,
    source: 'deterministic-rules-engine',
  });
});

function generateDeterministicExplanation(question: string, context: any): string {
  const q = question.toLowerCase();
  const scenario = context?.scenario || 'key_rename';
  const participant = context?.participant || 'RuralBank-X';
  const status = context?.status || 'MITIGATED';
  const verifierResult = context?.verifierResult;

  if (q.includes('why did this transaction fail') || q.includes('fail') || q.includes('mismatch')) {
    if (scenario === 'amount_tampering') {
      return `Transaction for **${participant}** failed because the upstream participant tampered with the core transaction amount payload. The gateway expected \`"amount": "450.00"\` but received \`"amount": "4500.00"\`. Although syntactically recognizable, the safety verifier detected a 10x value mismatch, violating Invariant Rule 1 (Financial Value Conservation) and blocking zero-downtime execution.`;
    }
    if (scenario === 'missing_field') {
      return `Transactions for **${participant}** failed with HTTP 422 Unprocessable Entity because the participant's upstream release completely omitted the mandatory cryptographic authorization reference (\`auth_ref\`). The DPI Gateway schema contract strictly requires \`auth_ref\` for idempotency and settlement clearance.`;
    }
    if (scenario === 'extra_field') {
      return `Transactions failed schema validation because **${participant}** injected an unauthorized financial attribute (\`admin_transfer: true\`). The DPI Gateway rejects arbitrary privileged attributes to prevent unauthorized elevation and privilege creep.`;
    }
    if (scenario === 'timestamp_format') {
      return `Transactions failed because **${participant}** switched from standard ISO-8601 UTC timestamp format (\`YYYY-MM-DDTHH:mm:ssZ\`) to a legacy localized slash format (\`DD/MM/YYYY HH:mm:ss\`). The strict DPI schema engine threw HTTP 422 format validation errors.`;
    }
    return `Transactions for **${participant}** failed with HTTP 422 schema validation errors due to an unannounced API contract drift. The participant renamed required fields: \`payer_vpa\` → \`vpa_id\`, \`amount\` → \`txn_amount\`, and \`auth_ref\` → \`reference_no\`. Without translation, the gateway cannot resolve mandatory settlement keys.`;
  }

  if (q.includes('safe') || q.includes('why was this adapter considered safe') || q.includes('verification')) {
    if (scenario === 'amount_tampering' || scenario === 'missing_field' || scenario === 'extra_field') {
      return `The adapter was **NOT** considered safe. The Safety Verifier evaluated the 6 formal invariants and rejected deployment:\n\n• **Rule 1 (Financial Value Conservation)**: Required input value must exactly match output value.\n• **Rule 3 (Sensitive Data Preservation)**: Mandatory audit trails cannot be dropped.\n• **Rule 4 (No Unauthorized Field Injection)**: Arbitrary flags are prohibited.\n\nBecause safety invariants were violated, the Edge Injector was blocked from deploying the hot-patch.`;
    }
    return `The adapter synthesized for **${participant}** was verified as SAFE because it satisfies all 6 formal safety invariants:\n\n1. **Financial Value Conservation**: Input \`txn_amount\` (₹450.00) maps 1:1 to \`amount\` (₹450.00) with zero scaling or delta.\n2. **Currency Conservation**: Currency is locked at INR with no FX conversion.\n3. **Sensitive Data Preservation**: \`reference_no\` is faithfully mapped to \`auth_ref\` without loss.\n4. **No Field Injection**: Zero extraneous or privileged parameters were synthesized.\n5. **Schema Completeness**: All required destination contract keys are fully populated.\n6. **Deterministic Mapping**: Bijection verified under SMT-style rule verification.`;
  }

  if (q.includes('what changed in the schema') || q.includes('schema diff') || q.includes('changed')) {
    return `**Schema Delta Analysis for ${participant}:**\n\n• \`payer_vpa\` (Expected) ← \`vpa_id\` (Received): Field alias remapping\n• \`amount\` (Expected) ← \`txn_amount\` (Received): Field alias remapping\n• \`auth_ref\` (Expected) ← \`reference_no\` (Received): Field alias remapping\n• Data Types: \`string\`, \`decimal string\`, \`alphanumeric\` preserved\n\nDiagnostic confidence: **99.8%** based on semantic clustering of 422 error clusters.`;
  }

  if (q.includes('rejected') || q.includes('blocked')) {
    return `The Safety Verifier rejects any adapter where input invariants cannot be proven. Unlike standard LLM translation tools, the DPI Swarm enforces deterministic invariant proofs. If an amount deviates by even 1 paisa (₹0.01) or if a required compliance field is dropped, deployment to the API gateway hot-path is strictly halted to protect central financial ledgers.`;
  }

  if (q.includes('what would happen if the amount changed') || q.includes('amount changed')) {
    return `If the amount is modified during transformation (e.g. ₹450.00 → ₹4500.00), the formal invariant checker triggers a **CRITICAL INVARIANT BREACH** on Rule 1 (Value Conservation). The system immediately flags the adapter as hazardous, emits an alert to the security audit log, halts the autonomous edge injection pipeline, and prompts human audit. Zero financial transactions are executed with corrupted amounts.`;
  }

  return `Incident State: **${status}** for **${participant}**. The Self-Healing DPI Swarm operates in continuous closed-loop autonomy. It monitors traffic at the edge, isolates schema contract violations to specific banking participants, synthesizes formal bijective adapters, validates them against mathematical invariants, and hot-injects them into the gateway with 0ms downtime. Once the upstream bank deploys their hotfix, the temporary adapter automatically retires.`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Self-Healing DPI Swarm Gateway',
    version: '1.0.0-dpi-prod',
    geminiConfigured: !!aiClient,
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DPI Swarm] Server running at http://localhost:${PORT}`);
  });
}

startServer();
