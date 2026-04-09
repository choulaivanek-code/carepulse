import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider } from './context/SidebarContext';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientReservation } from './pages/patient/PatientReservation';
import { PatientHistorique } from './pages/patient/PatientHistorique';
import { PatientMessagerie } from './pages/patient/PatientMessagerie';
import { PatientFeedback } from './pages/patient/PatientFeedback';
import { PatientTicket } from './pages/patient/PatientTicket';

// Agent Pages
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AgentCreerTicket } from './pages/agent/AgentCreerTicket';
import { AgentMessagerie as AgentMessageriePage } from './pages/agent/AgentMessagerie';

// Medecin Pages
import { MedecinConsole } from './pages/medecin/MedecinConsole';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUtilisateurs } from './pages/admin/AdminUtilisateurs';
import { AdminConfiguration } from './pages/admin/AdminConfiguration';
import { AdminRapports } from './pages/admin/AdminRapports';
import { AdminML } from './pages/admin/AdminML';

// Common
import { ProtectedRoute } from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <SidebarProvider>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/reserver" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientReservation /></ProtectedRoute>} />
          <Route path="/patient/historique" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientHistorique /></ProtectedRoute>} />
          <Route path="/patient/messagerie" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientMessagerie /></ProtectedRoute>} />
          <Route path="/patient/feedback" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientFeedback /></ProtectedRoute>} />
          <Route path="/patient/ticket/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientTicket /></ProtectedRoute>} />
          <Route path="/patient/ticket" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientTicket /></ProtectedRoute>} />

          {/* Agent Routes */}
          <Route path="/agent" element={<ProtectedRoute allowedRoles={['AGENT']}><AgentDashboard /></ProtectedRoute>} />
          <Route path="/agent/creer-ticket" element={<ProtectedRoute allowedRoles={['AGENT']}><AgentCreerTicket /></ProtectedRoute>} />
          <Route path="/agent/messagerie" element={<ProtectedRoute allowedRoles={['AGENT']}><AgentMessageriePage /></ProtectedRoute>} />

          {/* Medecin Routes */}
          <Route path="/medecin" element={<ProtectedRoute allowedRoles={['MEDECIN']}><MedecinConsole /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/utilisateurs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUtilisateurs /></ProtectedRoute>} />
          <Route path="/admin/configuration" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConfiguration /></ProtectedRoute>} />
          <Route path="/admin/rapports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminRapports /></ProtectedRoute>} />
          <Route path="/admin/ml" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminML /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
    </SidebarProvider>
  );
}

export default App;
