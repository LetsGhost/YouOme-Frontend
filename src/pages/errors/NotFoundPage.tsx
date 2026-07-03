import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-screen">
      <div className="auth-card panel" style={{ textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: "3.5rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--color-accent)",
          }}
        >
          404
        </p>
        <h1 style={{ margin: 0, color: "var(--color-ink)" }}>Page not found</h1>
        <p className="auth-copy">The page you're looking for doesn't exist or may have been moved.</p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button component={Link} to="/dashboard" variant="contained">
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
