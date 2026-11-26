import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UserManagementPage from './features/user-management/pages/UserManagementPage';
import AthleteListPage from './features/athlete/pages/AthleteListPage';
import AthleteFormPage from './features/athlete/pages/AthleteFormPage';
import AthleteDetailPage from './features/athlete/pages/AthleteDetailPage';
import CoachOfficialListPage from './features/coach-official/pages/CoachOfficialListPage';
import CoachFormPage from './features/coach-official/pages/CoachFormPage';
import CoachDetailPage from './features/coach-official/pages/CoachDetailPage';
import OfficialFormPage from './features/coach-official/pages/OfficialFormPage';
import OfficialDetailPage from './features/coach-official/pages/OfficialDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected layout */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/atlet" element={<AthleteListPage />} />
            <Route
              path="/atlet/tambah"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <AthleteFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/atlet/:id" element={<AthleteDetailPage />} />
            <Route
              path="/atlet/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <AthleteFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pelatih-official"
              element={<CoachOfficialListPage />}
            />
            <Route
              path="/pelatih-official/tambah/pelatih"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <CoachFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pelatih-official/tambah/official"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <OfficialFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/pelatih-official/pelatih/:id" element={<CoachDetailPage />} />
            <Route
              path="/pelatih-official/pelatih/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <CoachFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pelatih-official/official/:id"
              element={<OfficialDetailPage />}
            />
            <Route
              path="/pelatih-official/official/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manajemen']}>
                  <OfficialFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manajemen-user"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
