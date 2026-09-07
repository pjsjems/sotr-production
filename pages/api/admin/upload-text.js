import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readTexts, writeTexts, KV_URL, KV_TOKEN } from '../../../lib/adminData';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  // Parse multipart form manually
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const ct = req.headers['content-type'] || '';
  const bmatch = ct.match(/boundary=([^\s;]+)/);
  if (!bmatch) return res.status(400).json({ error: 'No boundary' });

  const boundary = '--' + bmatch[1];
  const parts = body.toString('binary').split(boundary)
    .filter(p => p.trim() && p.trim() !== '--');

  let textId = null;
  let lang = 'en';
  let fileName = null;
  let fileBuffer = null;
  let mimeType = null;

  for (const part of parts) {
    const [rawHdr, ...bodyParts] = part.split('\r\n\r\n');
    const rawBody = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '');
    if (rawHdr.includes('name="textId"')) {
      textId = rawBody.trim();
    } else if (rawHdr.includes('name="lang"')) {
      const val = rawBody.trim();
      if (['en', 'fr', 'es'].includes(val)) lang = val;
    } else if (rawHdr.includes('name="attachment"')) {
      const fnm = rawHdr.match(/filename="([^"]+)"/);
      fileName = fnm ? fnm[1] : 'attachment';
      const mm = rawHdr.match(/Content-Type:\s*([^\r\n]+)/i);
      mimeType = mm ? mm[1].trim() : 'application/octet-stream';
      fileBuffer = Buffer.from(rawBody, 'binary');
    }
  }

  if (!textId || !fileBuffer) {
    return res.status(400).json({ error: 'textId and attachment required' });
  }

  // Store file in KV as base64 (max 5MB)
  if (fileBuffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large. Maximum 5MB.' });
  }

  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;

  if (kvUrl && kvToken) {
    try {
      // English keeps the legacy bare key so attachments uploaded before
      // per-language support still resolve; French/Spanish get their own key
      // so uploading one language never touches another's file.
      const fileKey = lang === 'en'
        ? `sotr:text-attachment:${textId}`
        : `sotr:text-attachment:${textId}:${lang}`;
      const payload = {
        fileName,
        mimeType,
        data: fileBuffer.toString('base64'),
        uploadedAt: new Date().toISOString(),
      };
      await fetch(`${kvUrl}/set/${fileKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: JSON.stringify(payload) }),
      });

      // Update the text record with attachment info for this language
      const texts = await readTexts();
      const idx = texts.findIndex(t => t.id === textId);
      if (idx >= 0) {
        texts[idx][`attachmentName_${lang}`] = fileName;
        texts[idx][`attachmentMime_${lang}`] = mimeType;
        texts[idx][`hasAttachment_${lang}`] = true;
        if (lang === 'en') {
          // Keep legacy flat fields in sync for any older reader still using them
          texts[idx].attachmentName = fileName;
          texts[idx].attachmentMime = mimeType;
          texts[idx].hasAttachment = true;
        }
        await writeTexts(texts);
      }

      return res.status(200).json({
        success: true,
        fileName,
        downloadUrl: `/api/texts/download?id=${textId}&lang=${lang}`,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(500).json({
    error: 'File storage not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.'
  });
}
