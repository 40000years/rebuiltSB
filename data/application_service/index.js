const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

app.post('/applications', async (req, res) => {
    const {
        fullName, email, phone, age, gradeLevel, program,
        birthCertificate, transcript, parentContact, message, status, submittedAt
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO applications (
                full_name, email, phone, age, grade_level, program,
                birth_certificate, transcript, parent_contact, message, status, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [fullName, email, phone, age, gradeLevel, program,
             birthCertificate, transcript, parentContact, message, status, submittedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error saving application: ' + error.message });
    }
});

app.get('/applications/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM applications WHERE status = $1', ['pending']);
        res.status(200).json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching count: ' + error.message });
    }
});

app.listen(3001, () => {
    console.log('Application Service running on port 3001');
});