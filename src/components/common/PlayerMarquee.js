import { Suspense } from 'react';

import ErrorBoundary from '../error/ErrorBoundary';
import SpotlightMarqueeContent from './SpotlightMarqueeContent.js'

// import PillPreviewCard from './PillPreviewCard';
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