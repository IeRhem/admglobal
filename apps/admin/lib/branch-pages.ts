export const BRANCH_ACCESS_PAGES = [
  { path: "/", label: "Dashboard" },
  { path: "/events", label: "Events" },
  { path: "/testimonies", label: "Testimonies" },
  { path: "/users", label: "Users" },
  { path: "/branches", label: "Branches" },
  { path: "/activity-log", label: "Activity log" },
  { path: "/service-reports", label: "Service reports" },
] as const;

export const BRANCH_ACCESS_PAGE_PATHS = [
  "/",
  "/events",
  "/testimonies",
  "/users",
  "/branches",
  "/activity-log",
  "/service-reports",
] as const;
