import { Suspense } from "react";

import { useParams, useSearchParams } from 'react-router-dom';

import { UserResourceProvider } from "../../resources/UserResourceContext.js";
import PlayerSEO from '../../components/common/PlayerSEO.js';

import ErrorBoundary from '../../components/error/ErrorBoundary.js';

import UserError from '../../components/error/UserError.js';

import UserIntro from '../../components/slides/UserIntro.js';
import UserIntroFallback from '../../components/slides/UserIntroFallback.js';

import ChampSection from '../../components/slides/ChampSection.js';
import ChampRosterSection from '../../components/slides/ChampRosterSection.js';
import DamageSection from '../../components/slides/DamageSection.js';
import DateSection from '../../components/slides/DateSection.js';
import FFSection from '../../components/slides/FFSection.js';
import KDAsection from '../../components/slides/KDAsection.js';
import LaneSection from '../../components/slides/PingSlide.js';
import TotalTimeBreakdown from '../../components/slides/TotalTimeBreakdown.js';

import './PlayerStats.css'



import SlideDeck from "../../components/layout/SlideDeck.js";

import KillsSlide from "../../components/slides/KillsSlide.js";
import DeathsSlide from "../../components/slides/DeathsSlide.js";
import RoleSlide from "../../components/slides/RoleSlide.js";
import CsSlide from "../../components/slides/CsSlide.js";
import ObjectiveSlide from "../../components/slides/ObjectiveSlide.js";
import TimeSpentSlide from "../../components/slides/TimeSpentSlide.js";
import SummaryCard from "../../components/slides/SummaryCard.js";

const DEFAULT_YEAR = "2026";

function PlayerStats() {
	const { puuid } = useParams();
	const [searchParams] = useSearchParams();
	const year = searchParams.get('year') || DEFAULT_YEAR;

	return (
		<>
			<PlayerSEO puuid={puuid} year={year} />

			<UserResourceProvider puuid={puuid} year={year}>
				<ErrorBoundary fallback={(err) => <UserError error={err} />}>
					<Suspense fallback={<UserIntroFallback year={year} />}>

						<SlideDeck>

							<UserIntro year={year} />

							<ChampSection />
							<ChampRosterSection />
							<DateSection />
							<DamageSection />

							<KillsSlide puuid={puuid} year={year} />
							<KDAsection puuid={puuid} year={year} />
							<DeathsSlide puuid={puuid} year={year} />
							<FFSection />

							<RoleSlide puuid={puuid} />
							<CsSlide puuid={puuid} />
							<ObjectiveSlide puuid={puuid} />

							<LaneSection puuid={puuid} />
							<TimeSpentSlide puuid = {puuid} />
							<TotalTimeBreakdown puuid={puuid} year={year} />

							<SummaryCard />
						</SlideDeck>

					</Suspense>
				</ErrorBoundary>
			</UserResourceProvider>
		</>
	);
}

export default PlayerStats;