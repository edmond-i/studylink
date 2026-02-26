import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PageShell from './components/layout/PageShell';
import ForumHome from './pages/Forum/ForumHome';
import ForumCategory from './pages/Forum/ForumCategory';
import PostDetail from './pages/Forum/PostDetail';
import CreatePost from './pages/Forum/CreatePost';
import StudyGroupsHome from './pages/StudyGroups/StudyGroupsHome';
import GroupDetail from './pages/StudyGroups/GroupDetail';
import CreateGroup from './pages/StudyGroups/CreateGroup';
import AITutorHome from './pages/AITutor/AITutorHome';
import ChatInterface from './pages/AITutor/ChatInterface';
import Leaderboard from './pages/Leaderboard';
import UserProfile from './pages/UserProfile';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import ResourceLibrary from './pages/ResourceLibrary';
import ToastContainer from './components/ui/Toast';
import OfflineBanner from './components/ui/OfflineBanner';
import './App.css';

/**
 * Main App component with routing setup
 */
function App() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = Boolean(user && !user.isGuest);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <OfflineBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes with shell layout */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <PageShell>
                <Dashboard />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Forum routes */}
        <Route
          path="/forum"
          element={
            user ? (
              <PageShell>
                <ForumHome />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/forum/categories/:categorySlug"
          element={
            user ? (
              <PageShell>
                <ForumCategory />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/forum/posts/:postId"
          element={
            user ? (
              <PageShell>
                <PostDetail />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/forum/create"
          element={
            user ? (
              <PageShell>
                <CreatePost />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Study Groups routes */}

        <Route
          path="/groups"
          element={
            user ? (
              <PageShell>
                <StudyGroupsHome />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/groups/create"
          element={
            user ? (
              <PageShell>
                <CreateGroup />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/groups/:groupId"
          element={
            user ? (
              <PageShell>
                <GroupDetail />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Placeholder routes for other features */}
        <Route
          path="/groups/*"
          element={
            user ? (
              <PageShell>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <h1>Study Groups Coming Soon</h1>
                </div>
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* AI Tutor routes */}
        <Route
          path="/ai-tutor"
          element={
            user ? (
              <PageShell>
                <AITutorHome />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/ai-tutor/:chatId"
          element={
            user ? (
              <PageShell>
                <ChatInterface />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/leaderboard"
          element={
            user ? (
              <PageShell>
                <Leaderboard />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile/:userId"
          element={
            user ? (
              <PageShell>
                <UserProfile />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/library"
          element={
            user ? (
              <PageShell>
                <ResourceLibrary />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <PageShell>
                <UserProfile userId={user?.id} />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/pricing"
          element={
            user ? (
              <PageShell>
                <Pricing />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/billing"
          element={
            user ? (
              <PageShell>
                <Billing />
              </PageShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
