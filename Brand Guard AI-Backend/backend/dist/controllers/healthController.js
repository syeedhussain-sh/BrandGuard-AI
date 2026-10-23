"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
function getHealth(req, res) {
    res.status(200).json({
        status: 'ok',
        service: 'BrandGuard AI Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}
