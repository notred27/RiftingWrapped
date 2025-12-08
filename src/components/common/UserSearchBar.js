import { useState, useEffect, useRef, useMemo } from "react";

import Fuse from "fuse.js";

import { usePlayerListResources } from '../../resources/PlayerListContext';


export default function UserSearchBar() {
    const { playerList } = usePlayerListResources();
    const rawPlayers = playerList.read();

    // Normalize names
    const names = useMemo(() => {
        const arr = (rawPlayers || []);
        return arr.map((item) => {
            if (!item) return null;
            if (typeof item === "string") return { displayName: item, tag: "", region: "" };
            return {
                displayName: item.displayName ?? "",
                tag: item.tag ?? "",
                region: item.region ?? "",
                icon: item.icon ?? "",
            };
        }).filter(Boolean);
    }, [rawPlayers]);


    const [query, setQuery] = useState("");
    const [visible, setVisible] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [results, setResults] = useState([]);

    const fuseRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fuseRef.current = new Fuse(names, {
            keys: ["displayName"],
            includeMatches: true,
            threshold: 0.45,
            minMatchCharLength: 1,
        });
    }, [names]);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            return;
        }
        if (fuseRef.current) {
            const res = fuseRef.current.search(trimmed, { limit: 12 });
            setResults(res);
            setHighlightIndex(-1);
        } else {
            // fallback substring filter
            const fallback = names
                .filter((n) => (n.displayName || "").toLowerCase().includes(trimmed.toLowerCase()))
                .slice(0, 12)
                .map((n) => ({ item: n }));
            setResults(fallback);
            setHighlightIndex(-1);
        }
    }, [query, names]);

    // close when clicking outside
    useEffect(() => {
        function onDocClick(e) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) {
                setVisible(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    function selectUser(user) {
        const name = (user.displayName ?? "") + "#" + (user.tag ?? "");
        setQuery(name);
        setVisible(false);
        setResults([]);
        setHighlightIndex(-1);
        document.getElementById("regionSelect").value = user.region;

    }

    function onKeyDown(e) {
        if (!visible) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((h) => Math.min(h + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0 && results[highlightIndex]) {
                selectUser(results[highlightIndex].item);
            } else if (results.length === 1) {
                selectUser(results[0].item);
            }
        } else if (e.key === "Escape") {
            setVisible(false);
        }
    }

    function renderRow(user) {
        return (
            <div style={{ color: "white", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <img alt="user-icon" src={user.icon} style={{ width: "25px", height: "25px", borderRadius: "4px", marginRight: "4px" }} />
                <span>{user.displayName}#{user.tag ?? ""}</span>
                <span style={{ backgroundColor: "#201c3aff", color: "#aaa", marginLeft: "4px", padding: "2px 4px", borderRadius: "2px" }}> {user.region ?? ""}</span>
            </div>
        );
    }

    return (
        <>
            <select defaultValue="NA1" aria-label="region select" id="regionSelect" >
                <option value="BR1">BR1</option>
                <option value="EUN1">EUN1</option>
                <option value="EUW1">EUW1</option>
                <option value="JP1">JP1</option>
                <option value="KR">KR</option>
                <option value="LA1">LA1</option>
                <option value="LA2">LA2</option>
                <option value="ME1">ME1</option>
                <option value="NA1">NA1</option>
                <option value="OC1">OC1</option>
                <option value="RU">RU</option>
                <option value="SG2">SG2</option>
                <option value="TR1">TR1</option>
                <option value="TW2">TW2</option>
                <option value="VN2">VN2</option>
                <option value="TH2">TH2</option>
                <option value="PH2">PH2</option>
            </select>

            <div ref={containerRef} style={{ position: "relative", width: 360 }}>
                <input
                    ref={inputRef}
                    id="nameInput"
                    type="text"
                    name="username"
                    autoComplete="off"
                    value={query}
                    placeholder={"Game Name#Tag"}
                    onFocus={() => {
                        setVisible(true);
                        if (!query) setResults(names.slice(0, 5).map(n => ({ item: n })));
                    }}
                    onBlur={() => setTimeout(() => setVisible(false), 120)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setVisible(true);
                    }}
                    onKeyDown={onKeyDown}
                    aria-autocomplete="list"
                    aria-controls="player-listbox-fuzzy"
                    style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box" }}
                />

                {visible &&

                    (results.length > 0 ? (
                        <ul
                            id="player-listbox-fuzzy"
                            role="listbox"
                            style={{
                                position: "absolute",
                                top: "calc(100% + 6px)",
                                left: 0,
                                right: 0,
                                maxHeight: 260,
                                overflowY: "auto",
                                border: "1px solid #ddd",
                                borderRadius: 6,
                                background: "white",
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                                zIndex: 1000,
                            }}
                        >
                            {results.map((r, i) => {
                                const user = r.item;
                                if (i < 5) {
                                    return (
                                        <li
                                            key={`${user.displayName}-${i}`}
                                            className="dropdownItem"
                                            role="option"
                                            aria-selected={highlightIndex === i}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => selectUser(user)}
                                            onMouseEnter={() => setHighlightIndex(i)}
                                            style={{
                                                padding: "8px 10px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {renderRow(user)}
                                        </li>
                                    );
                                }
                                return null;
                            })}
                        </ul>

                    ) : null)}
            </div>
        </>

    );
}
