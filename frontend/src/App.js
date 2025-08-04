import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './App.css';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CustomerDetails from './pages/CustomerDetails';

function App() {
  return (
    <Router>
      <Header />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customer/:id" element={<CustomerDetails />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;