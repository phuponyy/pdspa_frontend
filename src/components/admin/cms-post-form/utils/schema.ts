export const parseSchemaJson = (
  raw: string | undefined,
  notify: (text: string, type?: "success" | "error" | "info") => void
) => {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid");
    }
    return parsed as Record<string, unknown>;
  } catch {
    notify("Schema JSON không hợp lệ. Vui lòng kiểm tra lại.", "error");
    return null;
  }
};
