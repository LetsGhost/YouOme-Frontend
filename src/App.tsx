import { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { buildTheme } from "./config/theme";
import { AppProvider } from "./app/AppStateContext";
import { ThemeModeProvider, useThemeMode } from "./app/ThemeModeContext";
import { GlobalErrorBoundary } from "./app/GlobalErrorBoundary";
import { AppShell } from "./widgets/layout/AppShell";
import { AdminRoute } from "./app/AdminRoute";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { PublicOnlyRoute } from "./app/PublicOnlyRoute";
import { LoadingScreen } from "./widgets/layout/LoadingScreen";

const HomePage = lazy(() => import("./pages/home/HomePage").then((m) => ({ default: m.HomePage })));
const AdminPage = lazy(() => import("./pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const GroupsPage = lazy(() => import("./pages/groups/GroupsPage").then((m) => ({ default: m.GroupsPage })));
const GroupDetailsPage = lazy(() =>
  import("./pages/groups/GroupDetailsPage").then((m) => ({ default: m.GroupDetailsPage }))
);
const GroupSettingsPage = lazy(() =>
  import("./pages/groups/GroupSettingsPage").then((m) => ({ default: m.GroupSettingsPage }))
);
const FriendsPage = lazy(() => import("./pages/friends/FriendsPage").then((m) => ({ default: m.FriendsPage })));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage").then((m) => ({ default: m.ExpensesPage })));
const SettlementsPage = lazy(() =>
  import("./pages/settlements/SettlementsPage").then((m) => ({ default: m.SettlementsPage }))
);
const NotificationsPage = lazy(() =>
  import("./pages/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() =>
  import("./pages/errors/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function RouteFallback() {
  return <LoadingScreen label="Loading..." />;
}

function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
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
                <Route path="/groups/:id/settings" element={<GroupSettingsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/settlements" element={<SettlementsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </GlobalErrorBoundary>
  );
}
