import React, { useMemo } from "react";
import "./TableEntry.css";

function monthInt2String(m) {
	return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] || "";
}

function championImgUrl(champion, version = "14.14.1") {
	return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png`;
}


const QUEUE_ID_MAP = {
	400: "Normal Draft",
	420: "Ranked Solo",
	430: "Normal Blind",
	440: "Ranked Flex",
	450: "ARAM",
	480: "Swift Play",
	710:"Ranked 5s",
	900: "URF",
	950:"Doom Bots",
	960:"Doom Bots",

	1020: "One for All",
	1700: "Arena",
	1710: "Arena",
	1750: "Arena",


	1900: "URF (Special)",
	2010: "Snow ARAM",
	2020: "Pick URF",
	2300:"Brawl",
	2400:"ARAM: Mayhem"
};


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



const VARIANT_CONFIG = {
	kills: { color: "#D85A30" },
	deaths: { color: "#378ADD"},
};

function TableEntryInner({ puuid, match, variant = "kills" }) {
	const stats = match.stats;
	const { color, Icon } = VARIANT_CONFIG[variant] || VARIANT_CONFIG.kills;

	const { dateStr, durationMinutes, champUrl, kdaDisplay } = useMemo(() => {
		const date = new Date(match.matchInfo.gameCreated);
		const dateStr = `${monthInt2String(date.getMonth())} ${date.getDate()}`;
		const durationMinutes = Math.floor(match.matchInfo.gameDuration / 60);
		const champUrl = championImgUrl(stats.champion);
		const kdaDisplay = stats.kda;

		return { dateStr, durationMinutes, champUrl, kdaDisplay };
	}, [match, stats]);

	const openMatch = () => {
		const matchId = stats.matchId.split("_")[1];
		window.open(`https://mobalytics.gg/lol/match/na/${stats.riotIdGameName}-${stats.riotIdTagline}/${matchId}`, "_blank");
	};

	return (
		<div
			className="compact-entry"
			onClick={openMatch}
			role="button"
			tabIndex={0}
		>


			<img loading="lazy" src={champUrl} alt={stats.champion} className="champion-icon-table" />
			{/* {roleIconUrl && <span className="roleIcon"><img loading="lazy" src={roleIconUrl} alt={`${stats.position} icon`} /></span>} */}

			<div className="compact-entry-meta">
				<span className="compact-entry-date">{dateStr} · {durationMinutes}&nbsp;min</span>
				<span className="compact-entry-kda">{stats.kills} / {stats.deaths} / {stats.assists}</span>
			</div>

			{/* <span>{objectivesGridJSX(stats)}</span> */}

			<div className="compact-entry-meta" style={{textAlign:"right"}}>
				<span className="compact-entry-date">{QUEUE_ID_MAP[match.queueId]}</span>
				<span className="compact-entry-kda">{kdaDisplay} KDA</span>
			</div>
		
		</div>
	);
}

const TableEntry = React.memo(TableEntryInner, (prevProps, nextProps) => {
	if (prevProps.match === nextProps.match && prevProps.puuid === nextProps.puuid && prevProps.variant === nextProps.variant) return true;

	const a = prevProps.match.stats;
	const b = nextProps.match.stats;
	return (
		prevProps.puuid === nextProps.puuid &&
		prevProps.variant === nextProps.variant &&
		a.kills === b.kills &&
		a.deaths === b.deaths &&
		a.assists === b.assists &&
		a.champion === b.champion
	);
});

export default TableEntry;