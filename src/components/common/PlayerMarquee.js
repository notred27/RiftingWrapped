import { Suspense, useMemo } from 'react';

import Marquee from 'react-fast-marquee';

import { createSpotlightResource } from '../../resources/SpotlightResource';
import ErrorBoundary from '../error/ErrorBoundary';
import PillPreviewCard from './PillPreviewCard';

import SpotlightMarqueeContent from './SpotlightMarqueeContent.js'

// const demoCards = [ /* ...your existing fallback data... */ ];



export default function PlayerMarquee() {
    return (
        <div className='marqueeContainer'>
            <ErrorBoundary fallback={() => <div>ERROR </div>}>
                <Suspense fallback={<div>FALLBACK </div>}>
                    <SpotlightMarqueeContent />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}