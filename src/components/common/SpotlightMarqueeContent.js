import { useMemo } from 'react';

import Marquee from 'react-fast-marquee';

import { createSpotlightResource } from '../../resources/SpotlightResource';
import PillPreviewCard from './PillPreviewCard';

export default function SpotlightMarqueeContent() {
    const resource = useMemo(() => createSpotlightResource(8), []);
    const players = resource.read();

    return (
        <Marquee speed={30} gradient={false} pauseOnHover={true} autoFill={true}>
            {players.map(card => (
                <PillPreviewCard key={card.username} {...card} style={{ marginRight: "1rem", width: "180px", height: "180px" }} />
            ))}
        </Marquee>
    );
}
