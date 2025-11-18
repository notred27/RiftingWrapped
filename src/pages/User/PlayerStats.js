import { useParams } from 'react-router-dom';
import ChampSection from '../../components/sections/ChampSection.js';
import DamageSection from '../../components/sections/DamageSection.js';
import DateSection from '../../components/sections/DateSection.js';
import FFSection from '../../components/sections/FFSection.js';
import KDAsection from '../../components/sections/KDAsection.js';
import LaneSection from '../../components/sections/LaneSection.js';
import TotalTimeBreakdown from '../../components/sections/TotalTimeBreakdown.js';

import UserIntro from '../../components/sections/UserIntro.js';
import UserIntroFallback from '../../components/sections/UserIntroFallback.js';

import '@fortawesome/fontawesome-free/css/all.min.css';


import { Suspense } from "react";

// import Temp from '../../components/sections/Temp.js';


import ErrorBoundary from '../../components/Error/ErrorBoundary.js';
import { UserResourceProvider } from "../../resources/UserResourceContext.js";
// import ErrorComponent from '../../components/Error/ErrorComponent.js'
import PlayerSEO from '../../components/common/PlayerSEO.js';
import StatDisplayError from '../../components/Error/StatDisplayError.js';
import UserError from '../../components/Error/UserError.js';

function PlayerStats() {
	const { puuid } = useParams();
	const year = "2025";

	return (
		<>
			<PlayerSEO puuid={puuid} year={year} />

			<UserResourceProvider puuid={puuid} year={year}>

				<ErrorBoundary fallback={(err) => <UserError error={err} />}>
					<Suspense fallback={<UserIntroFallback year={year} />}>
						<div className="fade-in">
							<UserIntro year={year} />
						</div>

						<ErrorBoundary fallback={(err) => <StatDisplayError error={err} />} >

							<div className="fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>

								<Suspense fallback={<div style={{ height: "500px", width: "80vw" }} />}>
									<DateSection />
									<FFSection />
									<ChampSection />
									<DamageSection />
									<KDAsection puuid={puuid} year={year} />
									<LaneSection puuid={puuid} year={year} />
									<TotalTimeBreakdown puuid={puuid} year={year} />
								</Suspense>

								{/* <Suspense fallback={<span />}>
                        <div className="fade-in">
                            <Temp year={year} />
                        </div>
                    </Suspense> */}

							</div>

						</ErrorBoundary>

					</Suspense>
				</ErrorBoundary>
			</UserResourceProvider>
		</>
	);
}

export default PlayerStats;
