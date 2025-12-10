import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
    const { user, loading, signIn, signUp, signOut } = useAuthContext();

    return {
        user,
        loading,
        signIn,
        signUp,
        signOut
    };
}
