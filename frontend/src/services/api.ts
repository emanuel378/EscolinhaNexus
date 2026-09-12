import axios from "axios";
import { supabase } from "./supabaseClient";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333",
});

// O supabase-js já mantém a sessão em localStorage e renova o access token
// automaticamente antes de expirar; getSession() devolve (ou renova, se
// necessário) o token atual, então não precisamos de lógica de refresh aqui.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});
