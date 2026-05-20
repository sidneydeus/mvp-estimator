import { viteNodeApp } from './app';

if (process.env.NODE_ENV === 'production') {
  const port = process.env.PORT || 3000;
  viteNodeApp.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
