import { useContext } from 'react';
import GameContext from './GameContext';

export const useGames = () => {
  const context = useContext(GameContext);

  return context;
};
