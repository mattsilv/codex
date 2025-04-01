import { useContext } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
