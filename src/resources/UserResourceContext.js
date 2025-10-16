import { createContext, useContext, useMemo } from "react";
import { fetchCached } from "./fetchCached.js";
import wrapPromise from './wrapPromise.js';


const StatsResourceContext = createContext(null);

export function UserResourceProvider({ puuid, year = "2025", children }) {


  function createResource(endpoint, puuid, year) {
      const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}`, `${endpoint}-${puuid}-${year}`);
      return wrapPromise(promise);
  }


  const resources = useMemo(() => {
    if (!puuid) return null;
    return {
      user: createResource('get_user', puuid, year),
      date: createResource('matchesByDate', puuid, year),
      forfeit: createResource('forfeit', puuid, year),
      damage: createResource('damage', puuid, year),
      champ: createResource('champs', puuid, year),

    };
  }, [puuid, year]);

  return (
    <StatsResourceContext.Provider value={resources}>
      {children}
    </StatsResourceContext.Provider>
  );
}

export function useStatsResources() {
  const ctx = useContext(StatsResourceContext);
  if (ctx === null) {
    throw new Error("useStatsResources must be used within a StatsResourceProvider");
  }
  return ctx;
}
