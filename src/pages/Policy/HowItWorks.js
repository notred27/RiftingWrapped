import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import "./Policy.css"

const STEPS = [
    {
        title: "1. You search for a player",
        body: <>
            <p>Type a Riot ID (name, tag and region) into the search bar. We look the account up through Riot's public API. There's nothing to sign up for or link.</p>
        </>
    },
    {
        title: "2. We find this year's matches",
        body: <>
            <p>For a new player, we ask Riot for every match ID they played since January 1st and put them in a queue. You land on a waiting page while this happens.</p>
        </>
    },
    {
        title: "3. Each match is processed",
        body: <>
            <p>Every 10 minutes a background job works through the queue, with new players first. For each match it pulls the full match data from Riot and saves only the stats your Wrapped needs:</p>
            <ul>
                <li>Champion, role, game mode and game length</li>
                <li>Kills, deaths, assists, CS, damage and objectives</li>
                <li>Where on Summoner's Rift your kills and deaths happened, for the heatmaps</li>
            </ul>
            <p>Depending on how much you play, a full year can take from a few minutes to about an hour. If you left your email on the waiting page, we send you one email when it's ready, then delete the address.</p>
        </>
    },
    {
        title: "4. Your stats stay up to date",
        body: <>
            <p>Once you're tracked, a job runs every hour to pick up the matches you've played since the last check. Your Wrapped and your weekly recap keep growing through the year with no action from you.</p>
        </>
    },
    {
        title: "5. Your Wrapped is built",
        body: <>
            <p>When you open your Wrapped, our API adds up your saved matches into totals, top champions, highlight games and heatmaps, and the site turns them into charts. Share links come with a preview image made from your own highlights.</p>
        </>
    },
];

const DETAILS = [
    {
        title: "What data we use",
        body: <p>Only public match data from Riot's API. No passwords, no account linking, and no private info. See the <Link to="/privacy">Privacy Policy</Link> for the full details.</p>
    },
    {
        title: "Under the hood",
        body: <>
            <ul>
                <li><strong>Frontend:</strong> React, hosted on AWS Amplify</li>
                <li><strong>API:</strong> Flask (Python), hosted on Render</li>
                <li><strong>Database:</strong> MongoDB Atlas</li>
                <li><strong>Background jobs:</strong> scheduled GitHub Actions for sign-ups, match processing and hourly updates</li>
            </ul>
            <p>Since it runs on free tiers, the first visit after a quiet spell can take up to a minute while the API wakes up.</p>
        </>
    },
];

export default function HowItWorks() {
    return (
        <>
            <Helmet defer={false}>
                <title>How It Works | Rifting Wrapped</title>
                <meta name="description" content="How Rifting Wrapped turns your public League of Legends match history into a year in review: from searching your Riot ID to charts, heatmaps and highlights." />
                <link rel="canonical" href={`https://www.riftingwrapped.com/how-it-works`} />
            </Helmet>

            <main className="policyContainer">
                <header className="policyHeader">
                    <h1>How It Works</h1>
                    <p className="policySubtitle">From a Riot ID to your League of Legends year in review.</p>
                </header>

                <section className="policyBody">
                    {[...STEPS, ...DETAILS].map((s) => (
                        <article key={s.title} className="policySection">
                            <h2>{s.title}</h2>
                            {s.body}
                        </article>
                    ))}
                </section>

                <p className="policyFooter">
                    Still have questions? Check the <Link className="policyContactLink" to="/faq">FAQ</Link>.
                </p>
            </main>
        </>
    );
}
