 
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import './App.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
