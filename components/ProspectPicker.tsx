"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search as SearchIcon } from "lucide-react";
import { statusBadge } from "@/lib/badges";

interface ProspectMatch {
  id: string;
  legalName: string;
  industry: string | null;
  status: string;
}

interface Props {
  /**
   * Called when the user picks an existing prospect.
   */
  onSelect: (prospect: ProspectMatch) => void;
  /**
   * Called when the user asks to create a new prospect with the typed query
   * (or clicks the "Create new" button). The returned prospect becomes the selection.
   */
  onCreate: (legalName: string) => Promise<ProspectMatch>;
  /**
   * Optional label above the input.
   */
  label?: string;
  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;
  autoFocus?: boolean;
}

export function ProspectPicker({
  onSelect,
  onCreate,
  label = "Prospect",
  placeholder = "Search existing or type new company name…",
  autoFocus = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ProspectMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/prospects/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setMatches(data.prospects ?? []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleCreate() {
    const name = query.trim();
    if (name.length < 2) {
      setError("Enter at least 2 characters for the company name.");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const p = await onCreate(name);
      onSelect(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create prospect");
    } finally {
      setCreating(false);
    }
  }

  const exactMatch = matches.find(
    (m) => m.legalName.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div className="field" style={{ position: "relative" }}>
      <label>{label}</label>
      <div className="search-box" style={{ width: "100%" }}>
        <SearchIcon size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </div>

      {(focused || matches.length > 0 || query) && (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 20,
            padding: 8,
            maxHeight: 340,
            overflowY: "auto",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loading && (
            <div className="muted" style={{ padding: 10, fontSize: 13 }}>
              Searching…
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div>
              <div className="overline" style={{ padding: "6px 10px" }}>
                Existing prospects
              </div>
              {matches.map((m) => {
                const s = statusBadge(m.status);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(m);
                    }}
                    className="nav-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "10px",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {m.legalName}
                      </div>
                      <div
                        className="muted"
                        style={{ fontSize: 12, marginTop: 2 }}
                      >
                        {m.industry ?? "—"}
                      </div>
                    </div>
                    <span className={s.className} style={{ flexShrink: 0 }}>
                      <span className="badge-dot"></span>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading &&
            query.trim().length >= 2 &&
            !exactMatch && (
              <div
                style={{
                  borderTop:
                    matches.length > 0 ? "1px solid var(--border)" : "none",
                  marginTop: matches.length > 0 ? 8 : 0,
                  paddingTop: matches.length > 0 ? 8 : 0,
                }}
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                  disabled={creating}
                  className="btn btn-secondary-color"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  {creating ? (
                    <>
                      <span className="spinner" /> Creating…
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create new prospect:{" "}
                      <strong style={{ marginLeft: 4 }}>
                        &ldquo;{query.trim()}&rdquo;
                      </strong>
                    </>
                  )}
                </button>
              </div>
            )}

          {!loading && matches.length === 0 && query.trim().length < 2 && (
            <div className="muted" style={{ padding: 10, fontSize: 13 }}>
              Type a company name to search or create a prospect.
            </div>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
