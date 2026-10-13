/**
 * Tech X Sol - Local Server Entry Point
 * Starts server on port 5000 (npm run dev)
 */

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Tech X Sol Server is RUNNING at http://localhost:${PORT}`);
  console.log(`📂 Home Page:     http://localhost:${PORT}/index.html`);
  console.log(`🛠️ Tools Page:    http://localhost:${PORT}/tools.html`);
  console.log(`📰 Blogs Page:    http://localhost:${PORT}/blog.html`);
  console.log(`🔐 Admin Portal:  http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});

