import { Helmet } from 'react-helmet-async';
import "./Policy.css";

const LAST_UPDATED = "July 11, 2026";
const CONTACT_EMAIL = "your-email@riftingwrapped.com"; // TODO: replace with your real contact email

export default function TermsOfService() {
    return (
        <>
            <Helmet>
                <title>Terms of Service | Rifting Wrapped</title>
                <link rel="canonical" href={`https://www.riftingwrapped.com/terms-of-service`} />
            </Helmet>

            <main className="policyContainer">
                <header className="policyHeader">
                    <h1>Terms of Service</h1>
                    <p className="policySubtitle">The rules for using Rifting Wrapped.</p>
                    <p className="policyUpdated">Last updated: {LAST_UPDATED}</p>
                </header>

                <section className="policyBody">
                    <article className="policySection">
                        <h2>1. Acceptance of these terms</h2>
                        <p>
                            By visiting or using Rifting Wrapped (the "Site"), you agree to these Terms of Service.
                            If you don't agree with them, please don't use the Site.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>2. What Rifting Wrapped is</h2>
                        <p>
                            Rifting Wrapped generates a personalized, year-in-review style summary of a League of
                            Legends player's public match history — things like top champions, hours played, and
                            highlight games. You don't need to create an account or link your Riot account to use it.
                            When you search for a Riot ID, we look up that account's public match history and add
                            it to our tracker so your stats can continue to update over time.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>3. Eligibility</h2>
                        <p>
                            Rifting Wrapped is intended for users who meet the minimum age requirements to play
                            League of Legends and to use Riot Games' services in their region. If you are under the
                            age required by your local law to consent to use of a service like this without a
                            parent or guardian, please only use the Site with a parent or guardian's involvement.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>4. Public data only</h2>
                        <p>
                            Rifting Wrapped only processes gameplay data that is publicly available through Riot
                            Games' official API — this includes match history, champion stats, and similar
                            in-game data tied to a public Riot ID. We do not access private account information,
                            payment details, or anything outside of what Riot's public API exposes.
                        </p>
                        <p>
                            Because League of Legends matches involve multiple players, looking up one Riot ID may
                            surface publicly available gameplay data connected to other players in the same match
                            (for example, in a highlight or heatmap). This is the same public match data Riot
                            already exposes through its own in-client match history — we don't collect anything
                            beyond that.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>5. Acceptable use</h2>
                        <p>When using Rifting Wrapped, you agree not to:</p>
                        <ul>
                            <li>Use the Site to harass, stalk, or dox another player</li>
                            <li>Attempt to disrupt, overload, or scrape the Site outside of normal browsing</li>
                            <li>Attempt to bypass rate limits, security measures, or access controls</li>
                            <li>Use the Site for any unlawful purpose, or in a way that violates Riot Games' policies</li>
                            <li>Misrepresent your affiliation with Rifting Wrapped or Riot Games</li>
                        </ul>
                    </article>

                    <article className="policySection">
                        <h2>6. Availability and accuracy</h2>
                        <p>
                            Rifting Wrapped is provided free of charge, on a best-effort basis, using free-tier
                            infrastructure. Stats may take time to initially load, may occasionally be delayed or
                            temporarily incorrect while new matches are processed, and the Site may be unavailable
                            from time to time. We don't guarantee uninterrupted access or perfect accuracy of any
                            stat shown.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>7. No warranty</h2>
                        <p>
                            The Site is provided "as is" and "as available," without warranties of any kind, either
                            express or implied, including but not limited to warranties of merchantability, fitness
                            for a particular purpose, or non-infringement.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>8. Limitation of liability</h2>
                        <p>
                            To the fullest extent permitted by law, Rifting Wrapped and its creator(s) are not
                            liable for any indirect, incidental, or consequential damages arising from your use of,
                            or inability to use, the Site.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>9. Donations</h2>
                        <p>
                            Rifting Wrapped is free to use. Donations toward hosting and development costs are
                            optional and non-refundable, and do not unlock any paid features or private data.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>10. Changes to these terms</h2>
                        <p>
                            We may update these Terms of Service from time to time. Continued use of the Site after
                            changes are posted means you accept the updated terms. We'll update the "Last updated"
                            date above whenever changes are made.
                        </p>
                    </article>

                    <article className="policySection">
                        <h2>11. Contact</h2>
                        <p>
                            Questions about these terms? Reach out at{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                        </p>
                    </article>
                </section>

                <p className="policyDisclaimer">
                    Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
                </p>
            </main>
        </>
    );
}