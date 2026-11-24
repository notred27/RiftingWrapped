import './PillPreviewCard.css';

// Spotlight card in the Home carousel: champion splash, the player's name in a
// chip, and their hours as the headline number.
export default function PillPreviewCard({ username, icon, hoursPlayed, champName, shareUrl }) {
    return (
        <a
            className="player-card"
            href={shareUrl}
            aria-label={`${username}'s Rifting Wrapped: ${hoursPlayed} hours on the Rift`}
        >
            <img
                className="player-card__art"
                loading="lazy"
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`}
                alt=""
            />
            <span className="player-card__name">
                <img className="player-card__icon" src={icon} alt="" />
                {username}
            </span>
            <span className="player-card__hours">
                {hoursPlayed}<span className="player-card__unit">hrs</span>
            </span>
        </a>
    );
}
