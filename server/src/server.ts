import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[StockSense Server] running on http://localhost:${PORT}`);
  console.log(`[StockSense Server] Health endpoint: http://localhost:${PORT}/api/health`);
});
