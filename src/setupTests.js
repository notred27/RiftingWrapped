import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// jsdom (via CRA's Jest 27) doesn't implement TextEncoder/TextDecoder, which
// react-router v7 requires at import time. Node has had both since v11, so
// borrow them rather than pulling in a polyfill package. This file runs via
// setupFilesAfterEnv, i.e. before any test module imports react-router-dom.
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}
