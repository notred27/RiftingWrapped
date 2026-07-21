import { Suspense } from 'react';

import ErrorBoundary from '../error/ErrorBoundary';
import SpotlightMarqueeContent from './SpotlightMarqueeContent.js'

// import PillPreviewCard from './PillPreviewCard';
// const demoCards = [ /* ...your existing fallback data... */ ];



const placeholderStyle = {
    textAlign: 'center',
    color: 'var(--text-muted-color)',
    fontSize: 'var(--fs-xs)',
    padding: '20px 0',
};

export default function PlayerMarquee() {
    return (
        <div className='marqueeContainer'>
            <ErrorBoundary fallback={() => <div style={placeholderStyle}>Couldn't load player spotlights.</div>}>
                <Suspense fallback={<div style={placeholderStyle}>Loading player spotlights...</div>}>
                    <SpotlightMarqueeContent />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}