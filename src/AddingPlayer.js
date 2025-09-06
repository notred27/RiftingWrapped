
import { Link, useNavigate, useParams } from 'react-router-dom';

import { createUserResource } from "./userResource.js";

import { Suspense, useEffect, useState, useMemo } from "react";

import UserIntro from './Sections/UserIntro.js';
import UserIntroFallback from './Sections/UserIntroFallback.js';


export default function PlayerStats() {

    const { puuid } = useParams();

    const year = 2025
    const [polling, setPolling] = useState(true);
    const [userData, setUserData] = useState([]);

    const nav = useNavigate();


    const resource = useMemo(() => createUserResource(puuid, year), [puuid]);


    useEffect(() => {
        let intervalId;
        let timerId;

        const fetchStatus = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_ENDPOINT;
                const r1 = await fetch(`${apiUrl}/get_user/${puuid}`);
                const d1 = await r1.json();

                const formData = new FormData();
                formData.append('displayName', d1["displayName"]);
                formData.append('tag', d1["tag"]);
                const response = await fetch(`${apiUrl}/get_user`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                setUserData(data[0]);

                if (data[0].status === "done") {
                    setPolling(false);
                    nav(`/player/${puuid}`)
                }
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
            clearInterval(timerId);
        };
    }, [polling]);


    return (<>
        <header className="siteHeader">
            <div className="logo">
                Rifting Wrapped 2025
            </div>
            <nav className="navMenu">
                <Link to="/">Home</Link>
                <Link to="/faq">FAQ</Link>

            </nav>
        </header>

        <Suspense fallback={<UserIntroFallback year={year} />}>
            <div className="fade-in">
                <UserIntro resource={resource} year={year} />
            </div>
        </Suspense>



        <div>
            <h2>User Status: {userData["status"]}</h2>
            {userData["status"] === "counting" && <p>Gathering your match history...</p>}
            {userData["status"] === "pending" && <p> {userData.processedMatches} / {userData.totalMatches} Matches Processed...</p>}
        </div>


        <p id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
    </>)
}