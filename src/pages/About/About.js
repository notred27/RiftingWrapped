import { Helmet } from 'react-helmet-async';

import "./About.css"

export default function About() {

    return (
        <>
            <Helmet>
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
            </Helmet>

            <>
                <header className="aboutHeader">
                    <h1>About</h1>
                </header>

            </>
        </>
    );
}
