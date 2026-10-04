import React, { useMemo } from "react";

import { useStatsResources } from "../../resources/UserResourceContext.js";
import "./TableEntry.css";

function monthInt2String(m) {
	return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] || "";
}

// Only used if the current Data Dragon version can't be loaded. Icons for
// champions released after this patch won't exist at this version.
const FALLBACK_DDRAGON_VERSION = "16.19.1";

function championImgUrl(champion, version) {
	return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png`;
}

function useDdragonVersion() {
	const { lolVersion } = useStatsResources();
	try {
		return lolVersion.read()[0] || FALLBACK_DDRAGON_VERSION;
	} catch (thrown) {
		// Still loading: let Suspense wait for it, as it does for the other data.
		if (thrown instanceof Promise) throw thrown;
		// Data Dragon unreachable: show what icons we can rather than failing the slide.
		return FALLBACK_DDRAGON_VERSION;
	}
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


/* Match ids are "<PLATFORM>_<number>" (e.g. "EUN1_1234567890"), so the platform
   the game was played on comes from the id itself. Without this every match link
   pointed at /na/ regardless of where the player actually plays. */
const PLATFORM_TO_REGION = {
	NA1: "na",
	EUW1: "euw",
	EUN1: "eune",
	KR: "kr",
	BR1: "br",
	JP1: "jp",
	LA1: "lan",
	LA2: "las",
	OC1: "oce",
	OC2: "oce",
	TR1: "tr",
	RU: "ru",
	PH2: "ph",
	SG2: "sg",
	TH2: "th",
	TW2: "tw",
	VN2: "vn",
	ME1: "me",
};

function TableEntryInner({ match }) {
	const stats = match.stats;
	// The match link needs the player's Riot ID. Read it from the player record
	// rather than the match: only some older match documents stored a copy,
	// so links for every other match came out as ".../undefined-undefined/...".
	const { user } = useStatsResources();
	const player = user.read();
	const ddragonVersion = useDdragonVersion();

	const { dateStr, durationMinutes, champUrl, kdaDisplay } = useMemo(() => {
		const date = new Date(match.matchInfo.gameCreated);
		const dateStr = `${monthInt2String(date.getMonth())} ${date.getDate()}`;
		const durationMinutes = Math.floor(match.matchInfo.gameDuration / 60);
		const champUrl = championImgUrl(stats.champion, ddragonVersion);
		const kdaDisplay = stats.kda;

		return { dateStr, durationMinutes, champUrl, kdaDisplay };
	}, [match, stats, ddragonVersion]);

	const openMatch = () => {
		const [platform, matchNumber] = String(match.matchId).split("_");
		const region = PLATFORM_TO_REGION[String(platform).toUpperCase()] || "na";
		window.open(
			`https://mobalytics.gg/lol/match/${region}/${encodeURIComponent(player.displayName)}-${encodeURIComponent(player.tag)}/${matchNumber}`,
			"_blank",
			"noopener,noreferrer"
		);
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