import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import GarageDetails from './pages/GarageDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import GarageRegister from './pages/GarageRegister';
import GarageDashboard from './pages/GarageDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Dashboard gets its own layout without standard Navbar/Footer */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <GarageDashboard />
            </ProtectedRoute>
          } />
          
          {/* Main App Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main style={{ minHeight: 'calc(100vh - 300px)', paddingTop: '70px' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/garage/:id" element={<GarageDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register-garage" element={<GarageRegister />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
