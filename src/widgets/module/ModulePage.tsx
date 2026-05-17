import { useMemo } from "react";

import { useAppState } from "../../app/AppStateContext";

export function ModulePage({
  title,
  description,
  moduleNames,
}: {
  title: string;
  description: string;
  moduleNames: string[];
}) {
  const { admin, reloadAdminState } = useAppState();

  const routes = useMemo(
    () =>
      admin.routes
        .filter((route) => moduleNames.includes(route.module))
        .sort((left, right) => left.path.localeCompare(right.path)),
    [admin.routes, moduleNames]
  );

  return (
    <div className="module-layout">
      <section className="panel module-hero">
        <p className="eyebrow">Feature module</p>
        <h3>{title}</h3>
        <p>{description}</p>
        <button type="button" className="button button-secondary" onClick={() => void reloadAdminState()}>
          Sync backend routes
        </button>
      </section>

      <section className="panel module-table-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Available backend routes</p>
            <h4>{routes.length} matched endpoints</h4>
          </div>
        </div>

        <div className="table-list">
          {routes.length === 0 && <div className="empty-state">Noch keine passenden Routen aus Redis geladen.</div>}
          {routes.map((route) => (
            <div className="table-row" key={`${route.method}:${route.path}`}>
              <div>
                <strong>{route.path}</strong>
                <span>{route.module}</span>
              </div>
              <span className="mini-tag mini-tag-success">{route.method}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}