import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import Login from './components/Login'


import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
} from "react-router-dom"

function App() {
  
  return (
    <Router>
        <Routes>
            <Route path="" element={<Login />} />
            <Route path="/login" element={<Login />} />

        </Routes>
    </Router>
  )
}

export default App