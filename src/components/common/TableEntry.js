import React, { useMemo } from "react";
import './TableEntry.css';

const QUEUE_ID_MAP = {
    400: "Normal Draft",
    420: "Ranked Solo",
    430: "Normal Blind",
    440: "Ranked Flex",
    450: "ARAM",
    480: "Swift Play",
    900: "URF",
    1020: "One for All",
    1700: "Arena",
    1900: "URF (Special)",
    2010: "Snow ARAM",
    2020: "Pick URF",
};

function monthInt2String(m) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] || "";
}


const ROLE_ICON = {
    TOP: "https://cdn.mobalytics.gg/assets/common/icons/lol-roles/16-top-bright.svg",
    BOTTOM: "https://cdn.mobalytics.gg/assets/common/icons/lol-roles/16-bot-bright.svg",
    MIDDLE: "https://cdn.mobalytics.gg/assets/common/icons/lol-roles/16-mid-bright.svg",
    UTILITY: "https://cdn.mobalytics.gg/assets/common/icons/lol-roles/16-sup-bright.svg",
    JUNGLE: "https://cdn.mobalytics.gg/assets/common/icons/lol-roles/16-jg-bright.svg",
};


function objectivesGridJSX(stats) {
    return (
        <div className="objectivesGrid">
            <span><img loading="lazy" src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/dragons.svg" alt="dragon" /></span>
            <span><img loading="lazy" src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/baron-nashor.svg" alt="baron" /></span>
            <span><img loading="lazy" src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/towers.svg" alt="tower" /></span>
            <span><img loading="lazy" src="https://cdn.mobalytics.gg/assets/common/icons/lol-game-objectives/inhibitor.svg" alt="inhibitor" /></span>

            <span>{stats.epicMonsters?.dragons ?? 0}</span>
            <span>{stats.epicMonsters?.barons ?? 0}</span>
            <span>{stats.towers ?? 0}</span>
            <span>{stats.inhibitors ?? 0}</span>
        </div>
    );
}

function championImgUrl(champion, version = "14.14.1") {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png`;
}


function TableEntryInner({ puuid, match }) {
    const stats = match.stats;

    const {
        dateStr,
        durationMinutes,
        queueLabel,
        champUrl,
        roleIconUrl,
        kdaDisplay,
        totalCS,
        csPerMin,
        containerBgClass,
    } = useMemo(() => {
        const date = new Date(match.matchInfo.gameCreated);
        const dateStr = `${monthInt2String(date.getMonth())} ${date.getDate()}`;
        const durationMinutes = Math.floor(match.matchInfo.gameDuration / 60);
        const queueLabel = QUEUE_ID_MAP[match.queueId] || "Other";

        const champUrl = championImgUrl(stats.champion);
        const roleIconUrl = ROLE_ICON[stats.position] || null;

        const kdaDisplay = match.stats.kda;
        const totalCS = (match.stats.cs || 0) + (match.stats.jungleCs || 0);

        const csPerMin = (match.matchInfo.gameDuration > 0)
            ? Math.round((match.stats.cs / (match.matchInfo.gameDuration / 60)) * 10) / 10
            : 0;

        const containerBgClass = stats.win ? "table-entry-win" : "table-entry-lose";

        return { dateStr, durationMinutes, queueLabel, champUrl, roleIconUrl, kdaDisplay, totalCS, csPerMin, containerBgClass };
    }, [match, stats]);

    const objectivesGrid = useMemo(() => objectivesGridJSX(stats), [stats]);

    const openMatch = () => {
        const matchId = match.stats.matchId.split("_")[1];
        window.open(`https://mobalytics.gg/lol/match/na/${match.stats.riotIdGameName}-${match.stats.riotIdTagline}/${matchId}`, "_blank");
    };

    return (
        <div className={`table-entry-container ${containerBgClass}`} onClick={openMatch} role="button" tabIndex={0}>
            <span className="table-entry-meta">{queueLabel} ∙ {dateStr} ∙ {durationMinutes} minutes</span>

            <div className="tableEntry">
                <div className="champTableGrid">
                    <img loading="lazy" src={champUrl} alt={stats.champion} className="champion-icon-table" />
                    {roleIconUrl && <span className="roleIcon"><img loading="lazy" src={roleIconUrl} alt={`${stats.position} icon`} /></span>}
                </div>

                <div className="kdaGrid">
                    <span className="kdaNums">{stats.kills} / {stats.deaths} / {stats.assists}</span>
                    <span className="kdaLabel">{kdaDisplay} KDA</span>
                </div>

                <div className="csGrid">
                    <span className="csNums">{totalCS} CS</span>
                    <span className="csLabel">{csPerMin} /min</span>
                </div>

                {objectivesGrid}
            </div>
        </div>
    );
}

// Re-render only when props change
const TableEntry = React.memo(TableEntryInner, (prevProps, nextProps) => {
    if (prevProps.match === nextProps.match && prevProps.puuid === nextProps.puuid) return true;

    const a = prevProps.match.stats;
    const b = nextProps.match.stats;
    return (
        prevProps.puuid === nextProps.puuid &&
        a.kills === b.kills &&
        a.deaths === b.deaths &&
        a.assists === b.assists &&
        a.champion === b.champion &&
        a.cs === b.cs
    );
});

export default TableEntry;
