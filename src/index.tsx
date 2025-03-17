import React from 'react'
import ReactDOM from 'react-dom/client'
import { NhostClient, NhostProvider } from '@nhost/react'
import { NhostApolloProvider } from '@nhost/react-apollo'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import {createTheme, ThemeProvider} from "@mui/material";
import App from './App'
import './index.css'

// Init root + nhost client
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
const nhost = new NhostClient({ subdomain: 'wtytcldhcwbdrznpgjiy', region: 'eu-central-1', devTools: true })
console.log("Nhost instance:", nhost);
nhost.auth.onAuthStateChanged((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});

// Render root app with proper providers (nhost + tooltip + theme + router)
root.render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <TooltipProvider>
          <ThemeProvider theme={createTheme({
            palette: {
              primary: {
                main: '#3F51B6',
                light: '#FFFFFF',
                dark: '#0D1339',
                contrastText: '#08061C',
              }
            },
          })}>
            <BrowserRouter future={{ v7_relativeSplatPath: false, v7_startTransition: false }}>
              <App />
            </BrowserRouter>
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>
)
