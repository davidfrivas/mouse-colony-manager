import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/pages/Navbar.js';
import LoginForm from './components/pages/LoginForm.js';
import RegisterForm from './components/pages/RegisterForm.js';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbar />}>
              <Route path="register" element={<RegisterForm />}/>
              <Route path="login" element={<LoginForm />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
      
  );
}

export default App;
