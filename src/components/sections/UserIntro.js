import { useStatsResources } from "./../../resources/UserResourceContext.js";
import './UserIntro.css'
import './styles.css'

import StatCard from "../common/StatCard.js";

export default function UserIntro({ year }) {
	const { user } = useStatsResources();
	const userInfo = user.read();

	return (
		<StatCard>
			<img
				src={`${userInfo.icon}`}
				alt="user icon"
				style={{
					width: "88px",
					height: "88px",
					borderRadius: "4px",
					// border: `2px solid var(--accent-color)`,
					maxWidth: "40vw",
				}}
			/>

			<h1 id="user-name" className="emphasize-lg">
				{userInfo.displayName}
			</h1>

			<p className="subtitle">
				#{userInfo.tag} · level {userInfo.level}
			</p>

			<span className="capsule">
				Rifting Wrapped {year}
			</span>

			<p>Let's dive in to your League of Legends performance in {year}!</p>
		</StatCard>
	);
}
