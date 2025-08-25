import './ChampGrid.css'

export default function ChampGrid({
  allChampions = [],
  playedChampions = [],
  champData= [],
  version = '13.14.1',
}) {
  const playedSet = new Set(playedChampions);

  const champCountMap = champData.reduce((acc, { champion, count }) => {
    acc[champion] = count;
    return acc;
  }, {});


return (
  <div className="champion-grid-container">
    <div className="champion-grid">
      {allChampions.map(champ => {
        const played = playedSet.has(champ.id);
        const count = champCountMap[champ.id] || 0;
        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`;

        return (
          <div key={champ.id} className="champion-icon-wrapper">
            <img
              loading="lazy"
              src={imgUrl}
              alt={champ.name}
              title={`${champ.name} - ${count} game${count === 1 ? '' : 's'}`}
              className={`champion-icon ${played ? '' : 'not-played'}`}
            />
          </div>
        );
      })}
    </div>
  </div>
);

}
