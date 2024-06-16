import { hydrateRoot } from 'react-dom/client'
import App from './App'
import { TodoStoreProvider } from './store'

hydrateRoot(
  document.getElementById('root'),
  <TodoStoreProvider todo={window.__STORE__.todo}>
    <App />
  </TodoStoreProvider>,
)
