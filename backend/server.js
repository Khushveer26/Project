// =============================================
//  server.js – Express Backend Server
//  Handles: POST /contact endpoint
//  Stores contact form data in MySQL database
// =============================================

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const db         = require('./db');

const app  = express();
const PORT = 5000;

// ── Middleware ──
app.use(cors());                         // Enable CORS for frontend requests
app.use(bodyParser.json());              // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// ── Root Route (Health Check) ──
app.get('/', (req, res) => {
    res.json({
        status : 'running',
        message: '🚀 Portfolio Backend Server is live!',
        endpoints: {
            'POST /contact': 'Submit contact form data'
        }
    });
});

// ── POST /contact ──
// Receives: { name, email, message }
// Inserts into MySQL contacts table
// Returns: { message: "Message sent successfully!" }
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // ── Server-side Validation ──
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'All fields (name, email, message) are required.'
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                error: 'Name must be at least 2 characters.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                error: 'Please provide a valid email address.'
            });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                error: 'Message must be at least 10 characters.'
            });
        }

        // ── Insert into Database ──
        const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
        const values = [name.trim(), email.trim(), message.trim()];

        const [result] = await db.execute(sql, values);

        console.log(`✅ New contact saved — ID: ${result.insertId}, Name: ${name}, Email: ${email}`);

        // ── Send Success Response ──
        res.status(200).json({
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('❌ Error saving contact:', error.message);

        res.status(500).json({
            error: 'Internal server error. Please try again later.'
        });
    }
});

// ── GET /contacts (Optional: View all contacts) ──
app.get('/contacts', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error fetching contacts:', error.message);
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`  🚀 Portfolio Backend Server`);
    console.log(`  📡 Running on: http://localhost:${PORT}`);
    console.log(`  📬 POST endpoint: http://localhost:${PORT}/contact`);
    console.log('═══════════════════════════════════════════');
    console.log('');
});
