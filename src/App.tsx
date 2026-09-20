import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./features/layout/components/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { NotFoundPage } from "./pages/NotFound";
import { NotificationsPage } from "./pages/Notifications";
import { ProjectsPage } from "./pages/Projects";
import { SettingsPage } from "./pages/Settings";
import { TasksPage } from "./pages/Tasks";
import { TeamPage } from "./pages/Team";

/**
 * The route table.
 *
 * `AppShell` is a layout route, so the sidebar and topbar stay mounted while
 * pages swap underneath them. The task detail view is a child *path* of
 * `/tasks` rather than a sibling route — the page reads `:taskId` from the URL
 * itself, which keeps the filters the user set alive while a task is open.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks/*" element={<TasksPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
