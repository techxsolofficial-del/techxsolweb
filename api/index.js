/**
 * Tech X Sol - Vercel Serverless Entry Point
 */

let app;
try {
  app = require('../src/app');
} catch (e) {
  app = require('../backend/src/app');
}

module.exports = app;
