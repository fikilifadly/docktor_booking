import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { login as apiLogin, type Patient } from "../lib/api";
import { jwtDecode } from "jwt-decode";

type AuthContextValue = {
  token: string | null;
  patient: Patient | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const PATIENT_KEY = "auth_patient";

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [patient, setPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem(PATIENT_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isTokenAccurate = (token: string | null, patient: Patient | null): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token ?? "");

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.warn("Token expired");
        return false;
      }

      const isIdMatch = decoded.sub === patient?.id;
      const isEmailMatch = decoded.email === patient?.email;

      return isIdMatch && isEmailMatch;
    } catch (error) {
      console.log("errorAuth: ", error);
      return false;
    }
  };

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedPatient = localStorage.getItem(PATIENT_KEY);
      if (savedToken) setToken(savedToken);
      if (savedPatient) setPatient(JSON.parse(savedPatient) as Patient);
    } catch {
      // ignore
    }
  }, []);

  const doLogin = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setPatient(res.patient);
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(PATIENT_KEY, JSON.stringify(res.patient));
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setPatient(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PATIENT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      patient,
      isAuthenticated: isTokenAccurate(token, patient),
      login: doLogin,
      logout,
    }),
    [token, patient, doLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
