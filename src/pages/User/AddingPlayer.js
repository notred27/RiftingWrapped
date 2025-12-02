import { Suspense, useEffect, useState } from "react";

import { useNavigate, useParams } from 'react-router-dom';

import UserIntro from '../../components/sections/UserIntro.js';
import UserIntroFallback from '../../components/sections/UserIntroFallback.js';

import { UserResourceProvider } from "../../resources/UserResourceContext.js";
import './PlayerStats.css';


export default function PlayerStats() {
    const year = 2025;
    const { puuid } = useParams();

    const nav = useNavigate();

    const [polling, setPolling] = useState(true);
    const [userData, setUserData] = useState([]);


    useEffect(() => {
        let intervalId;

        const fetchStatus = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_ENDPOINT;
                const response = await fetch(`${apiUrl}/users/${puuid}`);
                const data = await response.json();


                if (data.status === "done") {
                    setPolling(false);
                    nav(`/player/${puuid}`)
                }

                setUserData(data);

            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        if (polling) {
            fetchStatus();
            intervalId = setInterval(fetchStatus, 2000);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [polling, puuid, nav]);


    return (<>
        <UserResourceProvider puuid={puuid} year={year}>
            <Suspense fallback={<UserIntroFallback year={year} />}>
                <div className="fade-in">
                    <UserIntro year={year} />
                </div>
            </Suspense>
        </UserResourceProvider>

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {userData["status"] === "starting" && <p className="loading-text">Searching for user<span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span></p>}
            {userData["status"] === "counting" && <p className="loading-text">Gathering your match history<span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span></p>}
            {userData["status"] === "pending" && <div style={{ textAlign: "center" }}><h2 className="loading-text">Processing your matches<span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span></h2><h3>{userData.processedMatches} / {userData.totalMatches} Matches Processed</h3></div>}
        </div>

    </>)
}