import { Request, Response } from 'express';

export function getHealth(req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'BrandGuard AI Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
