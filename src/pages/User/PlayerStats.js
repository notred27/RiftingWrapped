import { Suspense } from "react";

import { useParams, useSearchParams } from 'react-router-dom';

import { UserResourceProvider } from "../../resources/UserResourceContext.js";
import PlayerSEO from '../../components/common/PlayerSEO.js';

import ErrorBoundary from '../../components/error/ErrorBoundary.js';
import StatDisplayError from '../../components/error/StatDisplayError.js';
import UserError from '../../components/error/UserError.js';

import UserIntro from '../../components/sections/UserIntro.js';
import UserIntroFallback from '../../components/sections/UserIntroFallback.js';

import ChampSection from '../../components/sections/ChampSection.js';
import DamageSection from '../../components/sections/DamageSection.js';
import DateSection from '../../components/sections/DateSection.js';
import FFSection from '../../components/sections/FFSection.js';
import KDAsection from '../../components/sections/KDAsection.js';
import LaneSection from '../../components/sections/LaneSection.js';
import TotalTimeBreakdown from '../../components/sections/TotalTimeBreakdown.js';

import './PlayerStats.css'
import SummaryCard from "../../components/sections/SummaryCard.js";

import SlideDeck from "../../components/slide/SlideDeck.js";


const DEFAULT_YEAR = "2026";

function PlayerStats() {
	const { puuid } = useParams();
	const [searchParams] = useSearchParams();
	const year = searchParams.get('year') || DEFAULT_YEAR;

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "fit-content" }}>
			<PlayerSEO puuid={puuid} year={year} />

			<UserResourceProvider puuid={puuid} year={year}>
				<ErrorBoundary fallback={(err) => <UserError error={err} />}>
					<Suspense fallback={<UserIntroFallback year={year} />}>
	

						<ErrorBoundary fallback={(err) => <StatDisplayError error={err} />} >

							<div className="fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>

								<Suspense fallback={<div style={{ height: "500px", width: "80vw" }} />}>
									<SlideDeck>

							<UserIntro year={year} />

										{/* <div className="slide" style={{ '--slide-bg': '#2d5c52', '--slide-fg': '#0f0f0f' }}> */}
										<DateSection />
										{/* </div> */}
										<FFSection />
										<ChampSection />
										<DamageSection />
										<KDAsection puuid={puuid} year={year} />
										<LaneSection puuid={puuid} />
										<TotalTimeBreakdown puuid={puuid} year={year} />
									</SlideDeck>
								</Suspense>
							</div>

						</ErrorBoundary>
					</Suspense>
				</ErrorBoundary>
			</UserResourceProvider>
		</div>
	);
}

export default PlayerStats;