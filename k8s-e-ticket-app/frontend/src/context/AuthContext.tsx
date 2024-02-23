import { useRouter } from "next/router";
import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { loginAdmin } from "../api/adminTripApi";

interface IAuthContextProps {
  isAuthenticated: boolean;
  loginAdminApiAction: (loginInfo: {
    email: string;
    password: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<IAuthContextProps | undefined>(
  undefined
);

const AuthContextProvider: FC<{
  children: ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  const router = useRouter();
  const [authenticated, setIsAuthenticated] =
    useState<boolean>(isAuthenticated);

  const loginAdminApiAction = useCallback(
    async (loginData: { email: string; password: string }) => {
      try {
        const { data } = await loginAdmin(loginData);
        setIsAuthenticated(true);
        router.replace(`/admin`);
      } catch (err: any) {}
    },
    [router]
  );
  return (
    <AuthContext.Provider
      value={{ isAuthenticated: authenticated, loginAdminApiAction }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
};
