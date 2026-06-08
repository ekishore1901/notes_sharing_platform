import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Header, Footer } from './components/ui';
import {
  HomePage,
  BrowsePage,
  UploadPage,
  NoteDetailPage,
  ProfilePage,
  SubjectsPage,
  SettingsPage,
  SavedNotesPage,
  SignInPage,
  SignUpPage,
} from './pages';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<AuthLayout><SignInPage /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><SignUpPage /></AuthLayout>} />

          <Route element={<Layout><HomePage /></Layout>} path="/" />
          <Route element={<Layout><BrowsePage /></Layout>} path="/browse" />
          <Route element={<Layout><UploadPage /></Layout>} path="/upload" />
          <Route element={<Layout><NoteDetailPage /></Layout>} path="/note/:id" />
          <Route element={<Layout><ProfilePage /></Layout>} path="/profile/:userId" />
          <Route element={<Layout><SubjectsPage /></Layout>} path="/subjects" />
          <Route element={<Layout><SettingsPage /></Layout>} path="/settings" />
          <Route element={<Layout><SavedNotesPage /></Layout>} path="/saved" />

          <Route
            path="*"
            element={
              <Layout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-heading font-bold text-secondary-900 mb-4">
                      404
                    </h1>
                    <p className="text-secondary-600 mb-6">Page not found</p>
                    <a href="/" className="btn-primary">
                      Go Home
                    </a>
                  </div>
                </div>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
