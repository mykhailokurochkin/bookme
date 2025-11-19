import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './components/Navigation';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <Navigation />
        <main className="flex-1">
          <Outlet />
        </main>
      </AuthProvider>
    </div>
  );
};

export default App;
