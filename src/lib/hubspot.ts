export interface UpsertContactInput {
  email: string;
  auditRequestId?: string;
}

// Stub: real HubSpot integration not yet wired up. Callers should treat this
// as best-effort and never block the user-facing response on its result.
export async function upsertContact(input: UpsertContactInput): Promise<void> {
  void input;
}
