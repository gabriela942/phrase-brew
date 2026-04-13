export const queryKeys = {
  templates: {
    all: ["templates"] as const,
    list: (filters: Record<string, unknown>) => ["templates", "list", filters] as const,
    detail: (id: string) => ["templates", "detail", id] as const,
  },
  submissions: {
    all: ["submissions"] as const,
    list: (status?: string) => ["submissions", "list", status] as const,
    detail: (id: string) => ["submissions", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  userRole: (userId: string) => ["userRole", userId] as const,
} as const;
