import { writeFile } from 'fs/promises';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const formData = new FormData();
        const buffers = [];

        req.on('data', chunk => buffers.push(chunk));
        req.on('end', async () => {
            const boundary = req.headers['content-type'].split('boundary=')[1];
            const rawData = Buffer.concat(buffers).toString();
            const parts = rawData.split(`--${boundary}`);

            const fields = {};
            const files = {};

            for (const part of parts) {
                if (part.includes('Content-Disposition')) {
                    const nameMatch = part.match(/name="([^"]+)"/);
                    const filenameMatch = part.match(/filename="([^"]+)"/);
                    const name = nameMatch ? nameMatch[1] : null;

                    if (filenameMatch) {
                        const filename = filenameMatch[1];
                        const contentStart = part.indexOf('\r\n\r\n') + 4;
                        const contentEnd = part.lastIndexOf('\r\n--');
                        const fileContent = Buffer.from(part.slice(contentStart, contentEnd), 'binary');
                        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                        await writeFile(filePath, fileContent);
                        files[name] = `/uploads/${filename}`;
                    } else if (name) {
                        const contentStart = part.indexOf('\r\n\r\n') + 4;
                        const contentEnd = part.lastIndexOf('\r\n--');
                        fields[name] = part.slice(contentStart, contentEnd).trim();
                    }
                }
            }

            const applicationData = {
                fullName: fields.fullName,
                email: fields.email,
                phone: fields.phone,
                age: parseInt(fields.age),
                gradeLevel: fields.gradeLevel,
                program: fields.program,
                birthCertificate: files.birthCertificate,
                transcript: files.transcript,
                parentContact: fields.parentContact,
                message: fields.message,
                status: 'pending',
                submittedAt: new Date().toISOString(),
            };

            const response = await fetch('http://application-service:3001/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData),
            });

            const result = await response.json();
            if (response.ok) {
                res.status(200).json({ message: 'ใบสมัครของคุณได้รับเรียบร้อยแล้ว' });
            } else {
                res.status(500).json({ message: result.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการประมวลผล: ' + error.message });
    }
}