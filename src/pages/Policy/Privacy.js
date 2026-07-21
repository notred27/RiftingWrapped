import { Helmet } from 'react-helmet-async';
import "./Policy.css";

const LAST_UPDATED = "July 11, 2026";
const CONTACT_EMAIL = "support@riftingwrapped.com";

export default function PrivacyPolicy() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | Rifting Wrapped</title>
                <link rel="canonical" href={`https://www.riftingwrapped.com/privacy-policy`} />
            </Helmet>

            <main className="policyContainer">
                <header className="policyHeader">
                    <h1>Privacy Policy</h1>
                    <p className="policySubtitle">How Rifting Wrapped handles data.</p>
                    <p className="policyUpdated">Last updated: {LAST_UPDATED}</p>
                </header>

                <section className="policyBody">
                    <article className="policySection">
                        <h2>1. Overview</h2>
                        <p>
                            Rifting Wrapped ("we", "us") respects your privacy. This policy explains what data we
                            collect, how we use it, and the choices you have. We only process public gameplay data
                            available from Riot Games' API — we don't require an account, a login, or any private
                            personal information to use the Site.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>2. Data we collect</h2>
                        <p><strong>Riot ID and public match data.</strong> When you search for a Riot ID, we
                            request that account's publicly available match history, champion stats, and related
                            gameplay data from Riot's official API, and store it so your Wrapped can continue
                            updating. We do not collect private account details, payment information, or Riot
                            account credentials — Rifting Wrapped never asks for your password and never requires
                            you to log in with your Riot account.</p>
                        <p><strong>Usage analytics.</strong> We use Google Analytics (GA4) to understand how
                            visitors use the Site — for example, which pages are viewed and how people navigate
                            between them. Google Analytics may use cookies or similar technologies and may collect
                            standard technical information such as your approximate location (derived from IP
                            address), browser type, device type, and pages visited. We do not use this data to
                            identify you personally.</p>
                        <p><strong>Email address (optional).</strong> If you choose to provide your email to be
                            notified when your Wrapped is ready, we use it only to send that one notification. We
                            don't add you to a mailing list or send marketing email from this address.</p>
                    </article>

                    <article className="policySection">
                        <h2>3. How we use data</h2>
                        <ul>
                            <li>To generate and display your personalized stats page</li>
                            <li>To keep your stats updated as new matches are played</li>
                            <li>To understand overall Site usage and improve performance</li>
                            {/* <li>To send a one-time "your Wrapped is ready" email, if you opted in</li> */}
                        </ul>
                    </article>

                    <article className="policySection">
                        <h2>4. Data about other players</h2>
                        <p>
                            Because League of Legends matches involve multiple players, a Wrapped page may include
                            publicly available gameplay data connected to other players from the same matches.
                            This data is already public through Riot's own API and in-client match history. We do not collect or expose anything beyond what
                            Riot itself makes publicly available.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>5. Third-party services</h2>
                        <p>We rely on a small number of third-party services to run Rifting Wrapped:</p>
                        <ul>
                            <li><strong>Riot Games API</strong> — the source of all match and gameplay data</li>
                            <li><strong>Google Analytics</strong> — for aggregate, anonymized usage statistics</li>
                            <li><strong>Hosting and infrastructure providers</strong> — to run the Site and store match data</li>
                        </ul>
                        <p>
                            Each of these providers has its own privacy practices governing any data they process
                            on our behalf.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>6. Cookies</h2>
                        <p>
                            The Site uses cookies associated with Google Analytics to help us understand usage
                            patterns. You can control or disable cookies through your browser settings; doing so
                            may not affect your ability to use the Site's core features.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>7. Data retention</h2>
                        <p>
                            We retain tracked account data for as long as needed to keep your Wrapped up to date.
                            If you'd like your Riot ID and associated match data removed from our tracker, contact
                            us using the details below and we'll process your request.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>8. Children's privacy</h2>
                        <p>
                            Rifting Wrapped is not directed at children under the age required by Riot Games or
                            applicable local law to independently use online services, and we do not knowingly
                            collect personal information from children under that age. If you believe a child has
                            provided us with personal information, please contact us so we can remove it.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>9. Your choices</h2>
                        <p>
                            You can use most of Rifting Wrapped without providing any personal information.
                            Riot IDs are public information, not personal account data.
                            {/* If you provided an email for notifications, you can request that we delete it at any time.  */}
                            You can also disable analytics cookies through your browser.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>10. Changes to this policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in how the Site
                            works. We'll update the "Last updated" date above whenever changes are made.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>11. Contact</h2>
                        <p>
                            Questions about this policy, or want your data removed? Reach out at{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                        </p>
                    </article>
                </section>

            </main>
        </>
    );
}