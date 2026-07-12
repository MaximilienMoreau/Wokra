// /profile/[handle] and /search are public read views (profils ouverts,
// recherche ouverte aux recruteurs sans compte) — only the mutation routes
// and the personalized feed require a session.
export const PROTECTED_PREFIXES = ["/profile/edit", "/profile/artifacts", "/feed", "/messages"];
