import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import app from './app.js';
import { createSocketServer } from './socket/index.js';
import { recoverStaleTasks } from './services/task.service.js';

const PORT = Number(process.env.PORT) || 3001;

const httpServer = createServer(app);

// Attach Socket.IO
createSocketServer(httpServer);

// Recover stale tasks on startup
recoverStaleTasks().then(() => {
  console.log('[server] Stale task recovery complete');
});

httpServer.listen(PORT, () => {
  console.log(`[server] API server running on http://localhost:${PORT}`);
  console.log(`[server] WebSocket server attached`);
});
