import './SharePreviewCard.css';

const SharePreviewCard = ({ username, hoursPlayed, champName, shareUrl, year = 2026, style }) => {
  return (
    <div className="share-preview" style={style} aria-label={`${username}'s Rifting Wrapped ${year} profile`} aria-hidden="false" >
      <a className="share-preview__link" href={shareUrl}>
        {champName && (
          <img
            className="share-preview__image"
            loading='lazy'
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`}
            alt={`${champName} splash`}
          />
        )}
        <div className="share-preview__content">
          <h2 className="share-preview__title">{username}'s Rifting Wrapped {year}</h2>
          <p className="share-preview__description">
            {username} spent <strong>{hoursPlayed}</strong> {hoursPlayed === 1 ? 'hour' : 'hours'} on the Rift this year. Check out their top stats!
          </p>
        </div>
      </a>
    </div>
  );
};


export default SharePreviewCard;
