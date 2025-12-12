import { Helmet } from 'react-helmet-async';

import "./Contact.css"

export default function About() {

    return (
        <>
            <Helmet>
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
            </Helmet>

            <main style={{minHeight:"90vh", padding:"50px"}}>
                <header className="header">
                    <h1>Contact Us</h1>


                    <h3>Have any questions, suggestions, or need support?</h3>

                    <p>You can reach us at: <a></a></p>

                    <p>We typically respond within a week, but responses may be delayed due to maintenance.</p>
                </header>

            </main>
        </>
    );
}
