import { Router } from 'express';
import { getClaims, renderCreatePage, getCalculatedAmount, createClaim } from '../controllers/claimController.js';
import { isCitizen, requireLogin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireLogin, getClaims); // ทั้งเจ้าหน้าที่และประชาชนเข้าถึงได้
router.get('/create', isCitizen, renderCreatePage); // เฉพาะประชาชน

// API สำหรับให้ View ยิงมาขอผลคำนวณจาก Model
router.get('/calculate', getCalculatedAmount);

// บันทึกข้อมูลคำขอ
router.post('/create', createClaim);

export default router;