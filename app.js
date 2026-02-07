import express, { urlencoded } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import fs from 'fs';
import claimRoutes from './routes/claimRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ตั้งค่า View Engine เป็น EJS
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Middleware สำหรับอ่านค่าจากฟอร์ม และ Static Files
app.use(urlencoded({ extended: true }));

// Session middleware (simple config for demo)
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// หน้า Login (render form)
app.get('/login', (req, res) => {
    try {
        const data = fs.readFileSync(join(__dirname, 'data', 'claimants.json'), 'utf8');
        const claimants = JSON.parse(data);
        return res.render('login', { claimants });
    } catch (err) {
        console.error('Failed to load claimants:', err);
        return res.render('login', { claimants: [] });
    }
});

// ระบบ Login
app.post('/login', (req, res) => {
    const { userId } = req.body;
    
    if (userId === 'admin') {
        req.session.role = 'official';
        req.session.userId = 'admin';
        res.redirect('/claims'); // เจ้าหน้าที่ไปดูหน้าสรุป
    } else {
        req.session.role = 'citizen';
        req.session.userId = userId; // เก็บ ID ประชาชนไว้กรองข้อมูล
        res.redirect('/claims/create'); // ประชาชนไปยังฟอร์มยื่นคำขอ
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// เชื่อมต่อ Routes
app.use('/claims', claimRoutes);

// หน้าแรกของเว็บให้ไปที่ Login
app.get('/', (req, res) => res.redirect('/login'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});