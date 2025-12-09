

// import { Suspense, useMemo } from 'react';

import Marquee from 'react-fast-marquee';

import PillPreviewCard from '../../components/common/PillPreviewCard';
// import SharePreviewCard from '../../components/common/SharePreviewCard';
// import { usePlayerListResources } from '../../resources/PlayerListContext';

const demoCards = [
    {
        username: "MrWarwickWide",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/6812.png",
        hoursPlayed: "186",
        champName: "Warwick",
        shareUrl: "/player/diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"
    },
    {
        username: "bigleagueplayer",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/1151.png",
        hoursPlayed: "665",
        champName: "Gragas",
        shareUrl: "/player/TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA"
    },
    {
        username: "jar",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/6095.png",
        hoursPlayed: "234",
        champName: "Nunu",
        shareUrl: "/player/DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw"
    },
    {
        username: "lostpanda",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/4960.png",
        hoursPlayed: "63",
        champName: "Lillia",
        shareUrl: "/player/KT-IOAcBE30hmg2NjLILeuaqZR-KKtewV5eOPeXpioqot_yx4Qwlh8BKq4KkwQhxLJu45uiX3PkvRg"
    },
    {
        username: "SemThigh",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/6940.png",
        hoursPlayed: "683",
        champName: "Varus",
        shareUrl: "/player/i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw"
    },

    {
        username: "Starmany",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/7015.png",
        hoursPlayed: "398",
        champName: "Vladimir",
        shareUrl: "/player/Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ"
    },
    {
        username: "ThiccShinobi2",
        icon: "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/6937.png",
        hoursPlayed: "546",
        champName: "Pantheon",
        shareUrl: "/player/XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw"
    },
]

export default function PlayerMarquee() {
    // const { playerList } = usePlayerListResources();
    // const rawPlayers = playerList.read();

    // console.log(rawPlayers)
    // // Normalize profiles
    // const profiles = useMemo(() => {
    //     const arr = (rawPlayers || []);
    //     return arr.map((item) => {
    //         if (!item) return null;
    //         if (typeof item === "string") return { displayName: item, tag: "", region: "" };
    //         return {
    //             displayName: item.displayName ?? "",
    //             tag: item.tag ?? "",
    //             region: item.region ?? "",
    //             icon: item.icon ?? "",
    //         };
    //     }).filter(Boolean);
    // }, [rawPlayers]);

    return (
        // <Suspense fallback={

        //     <div className='marqueeContainer' >
        //         <Marquee
        //             speed={30}
        //             gradient={false}
        //             pauseOnHover={true}
        //             autoFill={true}
        //         >

        //             {demoCards.map(card => (
        //                 <PillPreviewCard key={card.username} {...card} style={{ marginRight: "1rem", width: "300px", height: "300px", maxWidth: "20vw" }} />
        //             ))}
        //         </Marquee>
        //     </div>
        // }>

        <div className='marqueeContainer' >
            <Marquee
                speed={30}
                gradient={false}
                pauseOnHover={true}
                autoFill={true}
            >

                {demoCards.map(card => (
                    <PillPreviewCard key={card.username} {...card} style={{ marginRight: "1rem", width: "300px", height: "300px", maxWidth: "20vw" }} />
                ))}
            </Marquee>
        </div>

        // </Suspense>
    )
}