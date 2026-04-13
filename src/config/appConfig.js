export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL?.trim() || 'http://localhost:4000/api',
  repoUrl: import.meta.env.VITE_REPO_URL?.trim() || '',
  deployUrl: import.meta.env.VITE_DEPLOY_URL?.trim() || '',
}
