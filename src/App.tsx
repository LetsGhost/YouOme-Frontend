import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { theme } from "./config/theme";
import { AppProvider } from "./app/AppStateContext";
import { AppShell } from "./widgets/layout/AppShell";
import { HomePage } from "./pages/home/HomePage";
import { AdminPage } from "./pages/admin/AdminPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { GroupsPage } from "./pages/groups/GroupsPage";
import { GroupDetailsPage } from "./pages/groups/GroupDetailsPage";
import { FriendsPage } from "./pages/friends/FriendsPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { SettlementsPage } from "./pages/settlements/SettlementsPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ProtectedRoute, PublicOnlyRoute } from "./app/RouteGuards";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}