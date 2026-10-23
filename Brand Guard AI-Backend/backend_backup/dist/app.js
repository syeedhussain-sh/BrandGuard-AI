"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive during local development & integration testing
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Body parser
app.use(express_1.default.json());
// API Routes
app.use('/api', routes_1.default);
// 404 Handler
app.use((req, res) => {
    const errorResponse = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`
        }
    };
    res.status(404).json(errorResponse);
});
// Centralized Error Handler
app.use((err, req, res, _next) => {
    console.error('Unhandled server error:', err);
    const errorResponse = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: err.message || 'An unexpected error occurred.'
        }
    };
    res.status(500).json(errorResponse);
});
exports.default = app;
