import { Route, Routes } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import HomePage from './pages/HomePage';
import CampusListPage from './pages/CampusListPage';
import CampusDetailPage from './pages/CampusDetailPage';
import './App.css';

function App() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campus" element={<CampusListPage />} />
          <Route path="/campus/:id" element={<CampusDetailPage />} />
          <Route
            path="*"
            element={
              <div className="page-shell">
                <h1>Page not found</h1>
                <p>That page does not exist. Use the navigation to return to HuskyKit.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}

App.propTypes = {};

export default App;
