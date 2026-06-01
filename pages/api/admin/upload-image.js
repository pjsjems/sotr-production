// pages/api/admin/upload-image.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { updateBook } from '../../../lib/adminData';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const coversDir = path.join(process.cwd(), 'public', 'covers');
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

  const form = formidable({
    uploadDir: coversDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: ({ mimetype }) => mimetype && mimetype.startsWith('image/'),
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const bookKey = Array.isArray(fields.bookKey) ? fields.bookKey[0] : fields.bookKey;
    const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;

    if (!bookKey || !file) return res.status(400).json({ error: 'bookKey and cover file required' });

    const ext = path.extname(file.originalFilename || '.jpg').toLowerCase() || '.jpg';
    const finalName = `${bookKey}${ext}`;
    const finalPath = path.join(coversDir, finalName);

    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
    fs.renameSync(file.filepath, finalPath);

    const imageUrl = `/covers/${finalName}`;
    try {
      updateBook(bookKey, { image: imageUrl });
      res.status(200).json({ success: true, image: imageUrl });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
