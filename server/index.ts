import express from 'express';

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Automatically load all route files in server/routes/
  const routes = import.meta.glob('./routes/**/*.ts', { eager: true });

  for (const [routePath, routeModule] of Object.entries(routes)) {
    const route = (routeModule as any).default;
    if (route) {
      console.log(`Loaded route: ${routePath}`);
      app.use('/api/real', route);
    }
  }

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
