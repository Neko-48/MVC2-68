import fs from 'fs';
import { join } from 'path';
import Claim from '../models/Claim.js';
import LowIncomeClaim from '../models/LowIncomeClaim.js';
import HighIncomeClaim from '../models/HighIncomeClaim.js';

// read data from JSON files
const readData = (fileName) => {
    return JSON.parse(fs.readFileSync(join(process.cwd(), 'data', `${fileName}.json`), 'utf8'));
};

// create claim instance based on type
function createClaimInstance(income, type) {
    if (type === 'low_income') return new LowIncomeClaim(income);
    if (type === 'high_income') return new HighIncomeClaim(income);
    return new Claim(income);
}

// ดึงข้อมูลคำขอทั้งหมด พร้อมข้อมูลผู้ขอและจำนวนเงินเยียวยา
export const getClaims = (req, res) => {
    const claims = readData('claims');
    const claimants = readData('claimants');
    const compensations = readData('compensations');
    
    const userRole = req.session.role;
    const userId = req.session.userId;

    // กรองข้อมูล ประชาชนให้เห็นแค่ของตัวเอง 
    let filteredClaims = (userRole === 'official') 
        ? claims 
        : claims.filter(c => c.claimantId === userId);

    // ถ้าเป็นประชาชนแล้วยังไม่มีรายการคำขอ ให้แสดงหน้ารายการแบบว่าง (มีปุ่มยื่นคำขอ)
    if (userRole !== 'official' && (!filteredClaims || filteredClaims.length === 0)) {
        const joinedData = [];
        return res.render('request', { claims: joinedData, role: userRole, noClaims: true });
    }

    // join ข้อมูลจากตาราง claims, claimants และ compensations
    const joinedData = filteredClaims.map(claim => {
        const person = claimants.find(c => c.id === claim.claimantId);
        const comp = compensations.find(c => c.claimId === claim.claimId);

        return {
            ...claim,
            claimantName: person ? `${person.firstName} ${person.lastName}` : 'ไม่พบข้อมูล',
            amount: comp ? comp.amount : 0
        };
    });

    res.render('request', { claims: joinedData, role: userRole });
};

// บันทึกข้อมูลคำขอ
export const createClaim = (req, res) => {
    const { claimantId, income, type } = req.body;

    const claimId = Math.floor(10000000 + Math.random() * 90000000).toString();

    const claimObj = createClaimInstance(income, type);
    const amount = claimObj.calculate();

    const claimsPath = join(process.cwd(), 'data', 'claims.json');
    const compsPath = join(process.cwd(), 'data', 'compensations.json');

    const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    const compensations = JSON.parse(fs.readFileSync(compsPath, 'utf8'));

    claims.push({
        claimId,
        claimantId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
    });

    compensations.push({
        claimId,
        amount,
        calculatedDate: new Date().toISOString()
    });

    fs.writeFileSync(claimsPath, JSON.stringify(claims, null, 2), 'utf8');
    fs.writeFileSync(compsPath, JSON.stringify(compensations, null, 2), 'utf8');

    res.redirect('/claims');
};

// คำนวณจำนวนเงินเยียวยาตามรายได้และประเภทคำขอ
export const getCalculatedAmount = (req, res) => {
    const { income, type } = req.query;
    const claimObj = createClaimInstance(income, type);
    res.json({ amount: claimObj.calculate() });
};

// แสดงหน้าฟอร์มสร้างคำขอใหม่
export const renderCreatePage = (req, res) => {
    const claimants = readData('claimants');
    const claims = readData('claims');
    const userRole = req.session && req.session.role;
    const userId = req.session && req.session.userId;

    // ถ้าเป็นประชาชน: ให้เฉพาะตัวเองที่ยังไม่เคยยื่นคำขอ
    if (userRole === 'citizen') {
        const hasClaim = claims.some(c => c.claimantId === userId);
        if (hasClaim) return res.redirect('/claims');
        const person = claimants.find(c => c.id === userId);
        return res.render('create', { claimants: person ? [person] : [] });
    }

    // กันไม่ให้คนที่ยื่นซ้ำ
    const alreadyClaimedIds = claims.map(c => c.claimantId);
    const availableClaimants = claimants.filter(c => !alreadyClaimedIds.includes(c.id));
    res.render('create', { claimants: availableClaimants });
};