export * from "./generated/api";
// Note : `./generated/types` n'est pas re-exporté ici car il duplique les noms
// des schémas zod (LoginBody, CreateBandeBody, etc.). Si besoin des interfaces
// TS plates, importer directement depuis "@workspace/api-zod/generated/types/...".
