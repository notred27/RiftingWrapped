import { useRef, useState, useEffect, useMemo } from 'react';
import './ChampGrid.css';

export default function ChampGrid({
  allChampions = [],
  playedChampions = [],
  champData = [],
  version = '13.14.1',
  rows = 4,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showUnplayed, setShowUnplayed] = useState(true);

  const playedSet = useMemo(() => new Set(playedChampions), [playedChampions]);

  const champCountMap = useMemo(
    () =>
      champData.reduce((acc, { champion, count }) => {
        acc[champion] = count;
        return acc;
      }, {}),
    [champData]
  );

  const visibleChampions = useMemo(
    () => (showUnplayed ? allChampions : allChampions.filter(c => playedSet.has(c.id))),
    [allChampions, playedSet, showUnplayed]
  );

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    // Jump back to the start whenever the filtered list changes, so toggling
    // never leaves the view scrolled past the end of a now-shorter list
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0 });
    }
    updateScrollState();
  }, [visibleChampions]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  // Stop these clicks from bubbling up to SlideDeck, which treats a click anywhere
  // in the outer 30% of the deck as "go to next/previous slide" - without this, using
  // the arrows (which sit right in that zone) or the checkbox would also navigate away.
  const scrollByPage = (e, direction) => {
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="champion-grid-wrapper">


      <div className="champion-grid-container">
        <button
          type="button"
          className="champion-grid-nav champion-grid-nav-left"
          onClick={(e) => scrollByPage(e, -1)}
          disabled={!canScrollLeft}
          aria-label="Show previous champions"
        >
          ‹
        </button>

        <div className="champion-grid-scroll" ref={scrollRef} style={{ '--rows': rows }}>
          <div className="champion-grid">
            {visibleChampions.map(champ => {
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

        <button
          type="button"
          className="champion-grid-nav champion-grid-nav-right"
          onClick={(e) => scrollByPage(e, 1)}
          disabled={!canScrollRight}
          aria-label="Show more champions"
        >
          ›
        </button>
      </div>


	  <label className="champion-grid-toggle" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={showUnplayed}
          onChange={(e) => setShowUnplayed(e.target.checked)}
        />
        Show unplayed champions
      </label>
    </div>
  );
}