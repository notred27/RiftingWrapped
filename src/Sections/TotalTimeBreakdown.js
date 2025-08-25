import { useState, useEffect } from "react";

import TotalTimeGraph from "../graphs/TotalTimeGraph"
import SectionImage from './../SectionImage.js';
import SharePreviewCard from "../SharePreviewCard.js";

export default function TotalTimeBreakdown({ puuid, year }) {
    const [loading, setLoading] = useState(true);
    const [timeArr, setTimeArr] = useState([]);

    const [cardInfo, setCardInfo] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [totalStats, cardPreview] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/totalStats/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_card_preview/${puuid}?year=${year}`)

                ]);

                if (!totalStats.ok || !cardPreview.ok) {
                    throw new Error('Network response was not ok');
                }

                const [timeData, cardData] = await Promise.all([totalStats.json(), cardPreview.json()]);
                setTimeArr(timeData[0]);
                setCardInfo(cardData);
            } catch (error) {
                console.error('Failed to fetch champ data:', error)
                setTimeArr([]);
            } finally {
                setLoading(false);
            }
        }

        if (puuid) {
            fetchData()
        }
    }, [puuid, year])

    if (loading) return;
    if (!timeArr || timeArr.length === 0) return;


    const totalTime = Math.floor(timeArr["totalPlaytime"] / 3600);
    const totalTimeInRanked = Math.floor(timeArr["totalRankedTime"] / 3600);
    const totalTimeInRift = Math.floor(timeArr["totalSummonersRift"] / 3600);

    const ccTime = Math.floor(timeArr["timeCCingOthers"] / 3600);
    const deadTime = Math.floor(timeArr["totalTimeDead"] / 3600);
    const roamTime = Math.floor(timeArr["totalRoamTime"] / 3600);


    const dragonTime = Math.round(timeArr["dragons"] * 50 / 3600)
    const baronTime = Math.round(timeArr["barons"] * 40 / 3600)
    const baronBuffTime = Math.round(timeArr["barons"] * 180 / 3600)

    const otherTime = totalTime - (ccTime + deadTime + roamTime + dragonTime + baronTime + baronBuffTime)

    const timeLabels = ["Other", "Time Dead", "Time CC'ing Others", "Time Roaming", "Time Killing Baron", "Time Baron Buffed", "Time Killing Dragons"]
    const timeBreakdown = [otherTime, deadTime, ccTime, roamTime, baronTime, baronBuffTime, dragonTime]


    const shareUrl = `https://riftingwrapped.onrender.com/share/${puuid}`;
    const shareText = `I spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`;


    return (
        <>
            <SectionImage
                imgUrl={`https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-80471666c140f790f28dff68d72c384b`}
                offset={"10"}
            />

            <div className="centeredColumn">

                <h2 className="emphasize">In Conclusion</h2>

                <h2>You spent <span className="emphasize">{totalTime.toLocaleString()} hours</span> playing league this year.</h2>

                <h3>This includes <span className="emphasize">{totalTimeInRanked} hours</span> in Ranked matches, <span className="emphasize">{totalTimeInRift} hours</span> in Summoner's Rift, and <span className="emphasize">{totalTime - totalTimeInRanked - totalTimeInRift} hours</span> in other gamemodes.</h3>

                <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>

                <h2>That's equivalent to <span className="emphasize">{Math.floor(totalTime / 8)} workdays</span> or <span className="emphasize">{Math.floor(totalTime / 24)} full days</span>, for better or worse.</h2>
            </div>




        <h2>Impressed with your stats? Share your Rifting Wrapped Recap with friends!</h2>
        
        <div>

        <SharePreviewCard
            username={cardInfo["username"]}
            hoursPlayed={cardInfo["hoursPlayed"]}
            champName={cardInfo["champName"]}
            shareUrl={`https://riftingwrapped.onrender.com/share/${puuid}`}
        />
        </div>

        <div style={{display:"flex", justifyContent:"center", flexDirection:"row", gap:"20px"}}>

            <button
                onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Copied share link!");
                }}
                style={{backgroundColor:"#696c70ff", color:"white", width:"210px", textAlign:"center", padding:"10px 30px 10px 30px", textDecoration:"none", fontWeight:"600", border:"none", fontSize:"1rem", cursor:"pointer"}}
            >
                Copy Share Link
            </button>

            <a
                href={`https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                onClick={(e) => {
                    e.preventDefault();
                    window.open(
                        `https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                        '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=600'
                    );
                }}
                rel="noopener nofollow"
                target="_blank"
                style={{backgroundColor:"#186ac7ff", color:"white", width:"150px", textAlign:"center",  padding:"10px 30px 10px 30px", textDecoration:"none", fontWeight:"600"}}
            >
                Share on Twitter
            </a>

            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                onClick={(e) => {
                    e.preventDefault();
                    window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                        '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=600'
                    );
                }}
                rel="noopener nofollow"
                target="_blank"
                style={{backgroundColor:"#094a94ff", color:"white", width:"150px", textAlign:"center", padding:"10px 30px 10px 30px", textDecoration:"none", fontWeight:"600"}}
            >
                Share on Facebook
            </a>


            <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
                onClick={(e) => {
                    e.preventDefault();
                    window.open(
                        `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
                        '',
                        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=800'
                    );
                }}
                rel="noopener nofollow"
                target="_blank"
                style={{backgroundColor:"#ce280aff", color:"white",  width:"150px", textAlign:"center", padding:"10px 30px 10px 30px", textDecoration:"none", fontWeight:"600"}}
            >
                Share on Reddit
            </a>


            
        </div>


        <h2>Want to see your own recap? <a href="/" style={{color:"whitesmoke", fontWeight:"bold"}}>Try it now!</a></h2>
        </>
    )
}