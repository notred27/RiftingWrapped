import { Suspense, useMemo } from 'react';

import Marquee from 'react-fast-marquee';

import { createSpotlightResource } from '../../resources/SpotlightResource';
import ErrorBoundary from '../error/ErrorBoundary';
import PillPreviewCard from './PillPreviewCard';
import { fetchCached } from '../../resources/fetchCached';

export default function SpotlightMarqueeContent() {
    const resource = useMemo(() => createSpotlightResource(8), []);
    // console.log('resource:', resource, typeof resource.read);
    const players = resource.read();
    const cards = players?.length;

    return (
        <Marquee speed={30} gradient={false} pauseOnHover={true} autoFill={true}>
            {players.map(card => (
                <PillPreviewCard key={card.username} {...card} style={{ marginRight: "1rem", width: "180px", height: "180px" }} />
            ))}
        </Marquee>
    );
}
