import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LearnHub from './components/learn/LearnHub';
import ReferencePage from './components/reference/ReferencePage';
import SessionPage from './components/session/SessionPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/reference" element={<ReferencePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="*" element={<Navigate to="/reference" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
