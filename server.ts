import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

interface SystemValidationPayload {
  name?: unknown;
  category?: unknown;
  host?: unknown;
  region?: unknown;
}

interface AuditSummaryPayload {
  organizationName?: unknown;
  totalIncidents?: unknown;
  resolvedIncidents?: unknown;
  blockedExports?: unknown;
  approvedSummaries?: unknown;
  dateFilter?: unknown;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Health endpoint for prototype runtime verification
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'veilwatch-server',
      mode: 'simulated-prototype',
      localPrivacyBoundary: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side validation for adding a simulated infrastructure node
  app.post('/api/systems/validate', (req, res) => {
    const body = (req.body || {}) as SystemValidationPayload;
    const errors: string[] = [];

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const host = typeof body.host === 'string' ? body.host.trim() : '';
    const region = typeof body.region === 'string' ? body.region.trim() : '';

    if (name.length < 3 || name.length > 48) {
      errors.push('System name must be between 3 and 48 characters.');
    }
    if (!['server', 'application', 'network', 'security'].includes(category)) {
      errors.push('Category must be server, application, network, or security.');
    }
    if (host.length < 3 || host.length > 64 || /\s/.test(host)) {
      errors.push('Host or endpoint identifier must be 3 to 64 characters without spaces.');
    }
    if (region.length < 2 || region.length > 32) {
      errors.push('Environment zone must be between 2 and 32 characters.');
    }

    if (errors.length > 0) {
      res.status(400).json({ valid: false, errors });
      return;
    }

    res.json({
      valid: true,
      sanitized: {
        name,
        category,
        host,
        region,
      },
      validatedAt: new Date().toISOString(),
    });
  });

  // Server-side validation for sanitized audit report export metadata (never accepts raw logs or PII)
  app.post('/api/audit/summary', (req, res) => {
    const body = (req.body || {}) as AuditSummaryPayload;
    const org = typeof body.organizationName === 'string' ? body.organizationName.trim() : '';

    const numericFields = [
      body.totalIncidents,
      body.resolvedIncidents,
      body.blockedExports,
      body.approvedSummaries,
    ];

    const allNumbersValid = numericFields.every(
      (val) => typeof val === 'number' && Number.isFinite(val) && val >= 0
    );

    if (!org || org.length > 80 || !allNumbersValid) {
      res.status(400).json({
        valid: false,
        error: 'Invalid audit report metadata. Ensure organization name and non-negative counters are provided.',
      });
      return;
    }

    res.json({
      valid: true,
      exportCertificateId: `VW-AUD-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      policyAttestation: 'Sanitized summary verified — no raw inspection payloads transmitted.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VEILWATCH prototype server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VEILWATCH server:', err);
  process.exit(1);
});
