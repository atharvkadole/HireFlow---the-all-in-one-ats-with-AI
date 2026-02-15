import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './main/App.jsx'
import { Provider } from "react-redux";
import { store } from "./main/store";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
