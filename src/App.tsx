import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { ChatPage } from './pages/ChatPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { Layout } from './components/Layout';

type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'profile-setup'
  | 'dashboard'
  | 'chat'
  | 'articles';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && !profile) {
        setCurrentPage('profile-setup');
      } else if (user && profile) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('landing');
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'profile-setup':
        return <ProfileSetupPage />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  }

  const renderDashboardContent = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'articles':
        return <ArticlesPage />;
      default:
        return profile.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <InstructorDashboard />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderDashboardContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
