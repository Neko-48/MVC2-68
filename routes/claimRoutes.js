import { Router } from 'express';
import { getClaims, renderCreatePage, getCalculatedAmount, createClaim } from '../controllers/claimController.js';
import { isOfficial, isCitizen, requireLogin } from '../middleware/auth.js';

const router = Router();

// Middleware ตรวจสอบสิทธิ์
// /claims: both roles allowed; `getClaims` will handle role-specific views
router.get('/', requireLogin, getClaims);
router.get('/create', isCitizen, renderCreatePage); // เฉพาะประชาชน

// API สำหรับให้ View ยิงมาขอผลคำนวณจาก Model
router.get('/calculate', getCalculatedAmount);

// บันทึกข้อมูลคำขอ
router.post('/create', createClaim);

export default router;