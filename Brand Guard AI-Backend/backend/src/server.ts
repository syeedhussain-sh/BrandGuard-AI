import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` BrandGuard AI Backend Service Running  `);
  console.log(` Port: ${PORT}                           `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Base API URL: http://localhost:${PORT}/api`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
