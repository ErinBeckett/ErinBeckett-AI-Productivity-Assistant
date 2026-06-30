import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cachePut, cachePutMany, cacheDelete, cacheList, cacheGet, type CachedGeneration } from "./offline-cache";

export type GenerationType = "email" | "notes" | "tasks" | "presentation" | "diagram";

export interface GenerationInput {
  type: GenerationType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export async function listGenerations(): Promise<CachedGeneration[]> {
  const uid = await getUserId();
  if (!uid) return [];
  try {
    const { data, error } = await supabase
      .from("generations").select("*")
      .order("updated_at", { ascending: false }).limit(200);
    if (error) throw error;
    const rows = (data ?? []) as CachedGeneration[];
    await cachePutMany(rows);
    return rows;
  } catch {
    return cacheList(uid); // offline fallback
  }
}

export async function getGeneration(id: string): Promise<CachedGeneration | null> {
  try {
    const { data, error } = await supabase.from("generations").select("*").eq("id", id).single();
    if (error) throw error;
    await cachePut(data as CachedGeneration);
    return data as CachedGeneration;
  } catch {
    return (await cacheGet(id)) ?? null;
  }
}

export async function saveGeneration(input: GenerationInput): Promise<CachedGeneration> {
  const uid = await getUserId();
  if (!uid) throw new Error("Please sign in to save.");
  const { data, error } = await supabase.from("generations").insert({
    user_id: uid, type: input.type, title: input.title, content: input.content,
    metadata: input.metadata ?? {},
  }).select("*").single();
  if (error) throw error;
  await cachePut(data as CachedGeneration);
  return data as CachedGeneration;
}

export async function updateGeneration(id: string, patch: Partial<GenerationInput>): Promise<CachedGeneration> {
  const { data, error } = await supabase.from("generations").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  await cachePut(data as CachedGeneration);
  return data as CachedGeneration;
}

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase.from("generations").delete().eq("id", id);
  if (error) throw error;
  await cacheDelete(id);
}

// hooks
export function useGenerations() {
  return useQuery({ queryKey: ["generations"], queryFn: listGenerations });
}
export function useGeneration(id: string | undefined) {
  return useQuery({
    queryKey: ["generation", id],
    queryFn: () => (id ? getGeneration(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
export function useSaveGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveGeneration,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["generations"] }),
  });
}
export function useUpdateGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<GenerationInput> }) => updateGeneration(v.id, v.patch),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["generation", v.id] });
    },
  });
}
export function useDeleteGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGeneration,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["generations"] }),
  });
}

// Profile
export async function getProfile() {
  const uid = await getUserId();
  if (!uid) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (error) throw error;
  return data;
}
export async function upsertProfile(patch: Record<string, unknown>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles")
    .update({ ...patch, onboarded: true }).eq("id", uid).select("*").single();
  if (error) throw error;
  return data;
}
export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: getProfile });
}
