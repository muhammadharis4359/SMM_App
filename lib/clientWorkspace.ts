// BranDive SocialFlow AI - Client-side Workspace Selector Utility

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
  timezone: string;
  locale?: string;
  approvalMode?: string;
  emergencyPaused: boolean;
  plan?: {
    id: string;
    name: string;
    status: string;
  };
}

const STORAGE_KEY = 'socialflow_active_ws';

/**
 * Returns the currently active workspace from localStorage,
 * falling back to the first available workspace in the list.
 */
export function getActiveWorkspace(workspaces: WorkspaceSummary[]): WorkspaceSummary | null {
  if (!workspaces || workspaces.length === 0) return null;

  if (typeof window !== 'undefined') {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const match = workspaces.find((w) => w.id === savedId);
      if (match) return match;
    }
  }

  return workspaces[0];
}

/**
 * Sets the active workspace in localStorage and dispatches a custom event
 * so all listening components update immediately.
 */
export function setActiveWorkspace(workspaceId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, workspaceId);
    window.dispatchEvent(
      new CustomEvent('socialflow_ws_changed', { detail: { workspaceId } })
    );
  }
}
