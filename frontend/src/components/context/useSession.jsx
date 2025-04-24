import { useContext } from 'react';
import SessionContext from './SessionContext';

export const useSession = () => {
  const context = useContext(SessionContext);
  
  return context;
};
