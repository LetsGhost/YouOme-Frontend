import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, Radar, RefreshCcw, Server, TimerReset, Users, type LucideIcon } from "lucide-react";

import { useAppState } from "../../app/AppStateContext";
import { formatSeconds, formatTimestamp } from "../../shared/lib/format";
import type { RegisteredRoute } from "../../shared/api/backend";

type MongoStatus = {
  label: string;
  tone: "success" | "warning";
  detail: string;
};

export function AdminPage() {
  const { health, admin, currentUser, reloadAdminState, notice, setNotice } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      try {
        await reloadAdminState();
        setNotice({ tone: "success", message: "Admin state loaded from Redis-backed backend state." });
      } catch (error) {
        setNotice({
          tone: "error",
          message: error instanceof Error ? error.message : "Failed to load admin state.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [reloadAdminState, setNotice]);

  const groupedRoutes = useMemo(() => groupRoutes(admin.routes), [admin.routes]);
  const mongoStatus = useMemo<MongoStatus>(() => {
    if (health) {
      return {
        label: "Connected at startup",
        tone: "success",
        detail:
          "MongoDB is connected before the Express app starts. The backend does not expose a dedicated live Mongo health endpoint, so this card reflects startup-gated connection rather than a separate runtime probe.",
      };
    }

    return {
      label: "Unknown",
      tone: "warning",
      detail: "Backend health is unavailable, so MongoDB status cannot be inferred.",
    };
  }, [health]);

  const adminAreas = [
    { title: "Authentication", description: "Login, refresh, logout, and current-user session surface.", icon: Users },
    { title: "Backend State", description: "Redis-backed route inventory and job registry.", icon: Database },
    { title: "Infrastructure", description: "Health, uptime, and Redis connectability.", icon: Server },
    { title: "Scheduler", description: "Tracked background jobs and their enabled/running state.", icon: TimerReset },
    { title: "Domain modules", description: "Grouped route sets for users, auth, collaboration, groups, expenses, and settlements.", icon: Radar },
  ] as const;

  return (
    <div className="admin-layout">
      <section className="panel admin-hero">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Admin console</p>
            <h3>Backend observability and control surface</h3>
          </div>
          <button type="button" className="button button-secondary" onClick={() => void reloadAdminState()}>
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="admin-stats">
          <MetricCard icon={Database} label="Routes" value={String(admin.routes.length)} />
          <MetricCard icon={TimerReset} label="Jobs" value={String(admin.jobs.length)} />
          <MetricCard icon={Server} label="Uptime" value={health ? formatSeconds(health.uptime) : "--"} />
          <MetricCard icon={CheckCircle2} label="API state" value={health ? health.status : "unknown"} />
        </div>

        <div className="admin-badges">
          <StatusBadge label="Redis" value={health?.redis || "unknown"} tone={health?.redis === "connected" ? "success" : "warning"} />
          <StatusBadge label="MongoDB" value={mongoStatus.label} tone={mongoStatus.tone} />
          <StatusBadge label="Loaded" value={admin.loadedAt ? formatTimestamp(admin.loadedAt) : "not loaded"} tone={admin.loadedAt ? "success" : "warning"} />
        </div>

        <div className={`callout callout-${mongoStatus.tone}`}>
          <AlertTriangle size={16} />
          <span>{mongoStatus.detail}</span>
        </div>
      </section>

      <section className="panel admin-section">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Admin areas</p>
            <h4>What the backend already exposes</h4>
          </div>
        </div>

        <div className="feature-grid">
          {adminAreas.map((area) => (
            <article key={area.title} className="feature-card">
              <area.icon size={18} />
              <div>
                <strong>{area.title}</strong>
                <p>{area.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel admin-section">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Backend state</p>
            <h4>Redis-backed runtime snapshot</h4>
          </div>
        </div>

        <div className="admin-columns">
          <article className="subpanel">
            <h5>Registered jobs</h5>
            <div className="table-list">
              {admin.jobs.length === 0 && <EmptyState text={isLoading ? "Loading jobs..." : "No jobs reported yet."} />}
              {admin.jobs.map((job) => (
                <div key={job.name} className="table-row">
                  <div>
                    <strong>{job.name}</strong>
                    <span>{job.schedule}</span>
                  </div>
                  <div className="row-metrics">
                    <span className={`mini-tag ${job.enabled ? "mini-tag-success" : "mini-tag-warn"}`}>
                      {job.enabled ? "enabled" : "disabled"}
                    </span>
                    <span className={`mini-tag ${job.running ? "mini-tag-success" : "mini-tag-muted"}`}>
                      {job.running ? "running" : "idle"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="subpanel">
            <h5>Route inventory</h5>
            <div className="table-list">
              {admin.routes.length === 0 && <EmptyState text={isLoading ? "Loading routes..." : "No route inventory yet."} />}
              {admin.routes.map((route) => (
                <div key={`${route.method}:${route.path}`} className="table-row">
                  <div>
                    <strong>{route.path}</strong>
                    <span>{route.module}</span>
                  </div>
                  <span className="mini-tag mini-tag-success">{route.method}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="panel admin-section">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Module groups</p>
            <h4>Routes grouped by backend module</h4>
          </div>
        </div>

        <div className="module-grid">
          {groupedRoutes.map((group) => (
            <article key={group.module} className="module-card">
              <div className="module-card-head">
                <strong>{group.module}</strong>
                <span>{group.routes.length} routes</span>
              </div>
              <ul>
                {group.routes.map((route) => (
                  <li key={`${route.method}:${route.path}`}>
                    <span>{route.method}</span>
                    <strong>{route.path}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="admin-footnote">
          The backend currently exposes auth, users, redis state, and feature modules such as collaboration, group management, expenses, settlements, notifications, and P2P flows.
        </p>
      </section>

      <section className="panel admin-section admin-notice">
        <div className={`notice notice-${notice.tone}`}>
          <span>{notice.message || "Admin console ready."}</span>
        </div>
        <p className="admin-footnote">Current user: {currentUser?.email || "guest"}</p>
      </section>
    </div>
  );
}

function groupRoutes(routes: RegisteredRoute[]) {
  const map = new Map<string, RegisteredRoute[]>();

  for (const route of routes) {
    const current = map.get(route.module) ?? [];
    current.push(route);
    map.set(route.module, current);
  }

  return Array.from(map.entries()).map(([module, groupedRoutes]) => ({
    module,
    routes: groupedRoutes.sort((left, right) => left.path.localeCompare(right.path)),
  }));
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="metric-card admin-metric-card">
      <div className="metric-icon">
        <Icon size={18} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" }) {
  return <span className={`mini-tag ${tone === "success" ? "mini-tag-success" : "mini-tag-warn"}`}>{label}: {value}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}