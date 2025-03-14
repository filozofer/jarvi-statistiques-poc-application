import Home from '@/components/routes/app/home'
import {Route, Routes} from 'react-router-dom'

/**
 * Main App component with applications Routes.
 */
function App() {
    return (
        <Routes>
            <Route path="*" element={<Home/>} />
        </Routes>
    )
}

export default App
