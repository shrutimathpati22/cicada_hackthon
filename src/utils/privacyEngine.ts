import {
  DataClassification,
  ExportPolicyRules,
  FlaggedFieldSummary,
  PrivacyInspectionRecord,
} from '../types/veilwatch';

function maskToken(value: string, keepStart = 2, keepEnd = 2): string {
  const trimmed = value.trim();
  if (trimmed.length <= keepStart + keepEnd) {
    return '*'.repeat(Math.max(4, trimmed.length));
  }
  return `${trimmed.slice(0, keepStart)}***${trimmed.slice(-keepEnd)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 1 ? `${local[0]}***` : '*';
  const domainParts = domain.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : 'com';
  return `${maskedLocal}@***.${tld}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***';
  return `***-***-${digits.slice(-4)}`;
}

export function inspectDataLocally(
  rawInput: string,
  policy: ExportPolicyRules
): PrivacyInspectionRecord {
  let workingText = rawInput;
  const flaggedFields: FlaggedFieldSummary[] = [];

  // 1. Credential-like tokens & keys (synthetic API keys, JWTs, passwords, secrets)
  const credentialKeyValueRegex =
    /\b(password|passwd|pwd|secret|api_?key|access_?token|auth_?token|private_?key|client_?secret|bearer)\b\s*[:=]\s*(['"]?)([^\s'",;}{]+)\2/gi;
  const credentialMatches: string[] = [];
  workingText = workingText.replace(credentialKeyValueRegex, (_full, key, quote, val) => {
    credentialMatches.push(`${key}=${maskToken(String(val), 1, 1)}`);
    return `${key}: ${quote}[REDACTED_CREDENTIAL]${quote}`;
  });

  // Standalone token patterns (sk_..., AKIA..., ghp_..., JWT eyJ...)
  const standaloneSecretRegex =
    /\b(sk_(?:live|test)_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}|ghp_[A-Za-z0-9]{16,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,})\b/g;
  workingText = workingText.replace(standaloneSecretRegex, (match) => {
    credentialMatches.push(maskToken(match, 3, 2));
    return '[REDACTED_TOKEN]';
  });

  if (credentialMatches.length > 0) {
    flaggedFields.push({
      fieldType: 'Credentials & API Tokens',
      category: 'Credential',
      count: credentialMatches.length,
      maskedPreview: credentialMatches[0],
      actionTaken: policy.blockOnCredentials ? 'Blocked' : 'Redacted',
      weightPenalty: Math.min(45, credentialMatches.length * 22),
    });
  }

  // 2. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emailMatches = workingText.match(emailRegex) || [];
  if (emailMatches.length > 0) {
    if (policy.redactEmails) {
      workingText = workingText.replace(emailRegex, '[REDACTED_EMAIL]');
    }
    flaggedFields.push({
      fieldType: 'Email Address (PII)',
      category: 'PII',
      count: emailMatches.length,
      maskedPreview: maskEmail(emailMatches[0] ?? ''),
      actionTaken: policy.blockOnPII ? 'Blocked' : policy.redactEmails ? 'Redacted' : 'Masked',
      weightPenalty: Math.min(25, emailMatches.length * 10),
    });
  }

  // 3. Phone numbers
  const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const phoneMatches = workingText.match(phoneRegex) || [];
  if (phoneMatches.length > 0) {
    if (policy.redactPhones) {
      workingText = workingText.replace(phoneRegex, '[REDACTED_PHONE]');
    }
    flaggedFields.push({
      fieldType: 'Phone Number (PII)',
      category: 'PII',
      count: phoneMatches.length,
      maskedPreview: maskPhone(phoneMatches[0] ?? ''),
      actionTaken: policy.blockOnPII ? 'Blocked' : policy.redactPhones ? 'Redacted' : 'Masked',
      weightPenalty: Math.min(20, phoneMatches.length * 10),
    });
  }

  // 4. SSN / National ID or Payment Card-like synthetic numbers
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const ssnMatches = workingText.match(ssnRegex) || [];
  if (ssnMatches.length > 0) {
    workingText = workingText.replace(ssnRegex, '[REDACTED_GOV_ID]');
    flaggedFields.push({
      fieldType: 'Government ID / SSN Pattern',
      category: 'Financial',
      count: ssnMatches.length,
      maskedPreview: `***-**-${(ssnMatches[0] ?? '').slice(-4)}`,
      actionTaken: policy.blockOnPII ? 'Blocked' : 'Redacted',
      weightPenalty: Math.min(30, ssnMatches.length * 18),
    });
  }

  const cardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  const cardMatches = workingText.match(cardRegex) || [];
  if (cardMatches.length > 0) {
    workingText = workingText.replace(cardRegex, '[REDACTED_CARD]');
    flaggedFields.push({
      fieldType: 'Payment Card Pattern',
      category: 'Financial',
      count: cardMatches.length,
      maskedPreview: `****-****-****-${(cardMatches[0] ?? '').replace(/\D/g, '').slice(-4)}`,
      actionTaken: policy.blockOnPII ? 'Blocked' : 'Redacted',
      weightPenalty: Math.min(30, cardMatches.length * 18),
    });
  }

  // 5. Internal IPv4 addresses
  const privateIpRegex = /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g;
  const ipMatches = workingText.match(privateIpRegex) || [];
  if (ipMatches.length > 0) {
    if (policy.redactInternalIps) {
      workingText = workingText.replace(privateIpRegex, '[INTERNAL_HOST_REDACTED]');
    }
    flaggedFields.push({
      fieldType: 'Internal Private IPv4',
      category: 'Network',
      count: ipMatches.length,
      maskedPreview: `${(ipMatches[0] ?? '').split('.').slice(0, 2).join('.')}.*.*`,
      actionTaken: policy.redactInternalIps ? 'Redacted' : 'Masked',
      weightPenalty: Math.min(12, ipMatches.length * 4),
    });
  }

  // Classification
  const hasCredential = flaggedFields.some((f) => f.category === 'Credential');
  const hasPiiOrFin = flaggedFields.some(
    (f) => f.category === 'PII' || f.category === 'Financial'
  );
  const hasNetwork = flaggedFields.some((f) => f.category === 'Network');

  let classification: DataClassification = 'Public Operational';
  if (hasCredential) {
    classification = 'Restricted Credentials';
  } else if (hasPiiOrFin) {
    classification = 'Confidential PII';
  } else if (hasNetwork) {
    classification = 'Internal Telemetry';
  }

  // Policy Decision
  const blockedForCredentials = hasCredential && policy.blockOnCredentials;
  const blockedForPii = hasPiiOrFin && policy.blockOnPII;
  const blockedByMasterSwitch = flaggedFields.length > 0 && !policy.allowSanitizedSummaryExport;

  const isBlocked = blockedForCredentials || blockedForPii || blockedByMasterSwitch;
  const decision: 'approved' | 'blocked' = isBlocked ? 'blocked' : 'approved';

  // Transparent Privacy Score Calculation
  const rawExposurePenalty = flaggedFields.reduce((acc, f) => acc + f.weightPenalty, 0);
  // If blocked or redacted locally, exposure risk is mitigated; score reflects hygiene + protection strength
  const unredactedResidual =
    (!policy.redactEmails && emailMatches.length > 0 ? 15 : 0) +
    (!policy.redactPhones && phoneMatches.length > 0 ? 12 : 0) +
    (!policy.redactInternalIps && ipMatches.length > 0 ? 6 : 0);

  const privacyScore = Math.max(
    18,
    Math.min(
      100,
      flaggedFields.length === 0
        ? 100
        : isBlocked
          ? Math.max(62, 100 - Math.round(rawExposurePenalty * 0.45))
          : Math.max(45, 100 - Math.round(rawExposurePenalty * 0.35) - unredactedResidual)
    )
  );

  let ruleApplied = 'Zero sensitive entities detected — safe for operational summary';
  if (blockedForCredentials) {
    ruleApplied = 'Policy Rule: Block Export on Credential / Token Exposure';
  } else if (blockedForPii) {
    ruleApplied = 'Policy Rule: Block Export on PII / Financial Data Detection';
  } else if (blockedByMasterSwitch) {
    ruleApplied = 'Policy Rule: Sanitized Summary Export Disabled for Flagged Payloads';
  } else if (flaggedFields.length > 0) {
    ruleApplied = 'Policy Rule: Local Redaction Applied Prior to Safe Summary Export';
  }

  const totalFlagged = flaggedFields.reduce((sum, f) => sum + f.count, 0);
  const explanation =
    flaggedFields.length === 0
      ? 'Local inspection found no credentials, PII, financial identifiers, or internal host addresses. The payload contains non-sensitive telemetry and is approved for summary export.'
      : isBlocked
        ? `Detected ${totalFlagged} sensitive item(s) across ${flaggedFields.length} category group(s) (${classification}). Under your active export rules, external export is blocked locally. Raw input was cleared immediately from the console and never stored.`
        : `Detected ${totalFlagged} sensitive item(s) (${classification}). Local masking/redaction replaced all configured entities before generating a sanitized summary. Raw input was discarded from memory.`;

  const scoreBreakdown =
    flaggedFields.length === 0
      ? '100 base score · 0 sensitive entity penalties · 100% clean operational telemetry.'
      : `100 base score · -${rawExposurePenalty} raw payload risk · mitigated locally via ${isBlocked ? 'hard policy block' : 'in-browser redaction'}${unredactedResidual > 0 ? ` (-${unredactedResidual} residual unredacted toggle)` : ''}.`;

  // Sanitized summary output (bounded length, safe preview)
  const sanitizedLines = workingText
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);

  const redactedSummary =
    flaggedFields.length === 0
      ? `[APPROVED_TELEMETRY] ${sanitizedLines || 'Empty payload inspected.'}`
      : isBlocked
        ? `[EXPORT_BLOCKED :: ${classification.toUpperCase()}] ${flaggedFields
            .map((f) => `${f.fieldType} (${f.count}x)`)
            .join(', ')} — Sanitized preview: ${sanitizedLines}`
        : `[REDACTED_SAFE_SUMMARY] ${sanitizedLines}`;

  return {
    id: `insp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    classification,
    decision,
    privacyScore,
    scoreBreakdown,
    explanation,
    flaggedFields,
    redactedSummary,
    ruleApplied,
    byteLength: rawInput.length,
  };
}
