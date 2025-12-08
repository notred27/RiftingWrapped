import { createContext, useContext, useMemo } from "react";
import { fetchCached } from "./fetchCached.js";
import wrapPromise from "./wrapPromise.js";

const PlayerListContext = createContext(null);

export function PlayerListProvider({ children }) {
    const resources = useMemo(() => {
        const url = `${process.env.REACT_APP_API_ENDPOINT}/users/all`;
        return {
            playerList: wrapPromise(fetchCached(url, "users-all")),
        };
    }, []);

    return (
        <PlayerListContext.Provider value={resources}>
            {children}
        </PlayerListContext.Provider>
    );
}

export function usePlayerListResources() {
    const ctx = useContext(PlayerListContext);
    if (ctx === null) {
        throw new Error("usePlayerListResources must be used within a PlayerListProvider");
    }
    return ctx;
}
