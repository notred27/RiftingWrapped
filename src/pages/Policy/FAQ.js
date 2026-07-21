import { Helmet } from 'react-helmet-async';

import "./Policy.css"

const DEFAULT_FAQ = [
    {
        q: "What is Rifting Wrapped?",
        a: "Rifting Wrapped is your personalized yearly recap of your time on Rifting, highlighting your stats, achievements, and memorable moments. It started as a personal passion project, but is now expanding to let all users view their stats!"
    },
    {
        q: "Do I need an account?",
        a: "You don't need to link an account or sign up for a permanent account to view your stats on Rifting Wrapped. Instead, when you first search for your account, we gather your public match history and add the account name to a tracker so we can continue to update your stats. No additional accounts are needed!"
    },
    {
        q: "Why isn't my Wrapped loading?",
        a: "When your profile is first added, it can take a while for your stats to initially load (up to an hour). Additionally, since we are currently using free services, it may take up to a minute for your stats to load in when first visiting the site. If your stats don't load after a few minutes, check your internet connection or try again later."
    },
    {
        q: "What if my stats look wrong?",
        a: "Sometimes it takes a bit of time for new matches to be processed. Try refreshing later, and if it still looks off, check back in a day or two."
    },
    {
        q: "How do you use my data?",
        a: "We only process public gameplay data available from Riot's API. This means that private matches and personal info about a user's account are not included in any data used by this app."
    },
    {
        q: "When is Rifting Wrapped updated?",
        a: "Rifting Wrapped will be refreshed at the end of each year to give you a full picture of your season. Additionally, new matches are added on the hour to keep your current stats up to date."
    },
    {
        q: "Is Rifting Wrapped free?",
        a: "Of course! By taking advantage of public resources, Rifting Wrapped is currently free for all users. However, any donations toward improving and maintaining this website are appreciated!"
    },
    {
        q: "What kind of stats do you show?",
        a: "We highlight things like your most played champions, total hours played, highlight games from the past year, and even heatmaps showing your kill/death locations."
    },
    {
        q: "Who is Rifting Wrapped for?",
        a: "It's for anyone who plays League of Legends and wants a fun breakdown of their activity over the past year. It started out as a small project that was shared between friends, but is now expanding to all LOL players!"
    },
    {
        q: "Can I share my Wrapped?",
        a: "Yes! Once your Wrapped is generated, you can copy your unique link to share it directly on social media. After the link is shared, a personalized banner will appear with details about your highlights."
    },
    {
        q: "Can I compare my Wrapped with friends?",
        a: "Yes! You can share your recap link and see how you stack up side by side with your friends."
    }
];


export default function FAQ({ items = DEFAULT_FAQ }) {
    return (
        <>
            <Helmet defer={false}>
                <title>FAQ | Rifting Wrapped</title>
                <link rel="canonical" href={`https://www.riftingwrapped.com/faq`} />
            </Helmet>

            <main className="policyContainer">
                <header className="policyHeader">
                    <h1>FAQ</h1>
                    <p className="policySubtitle">Quick answers to frequently asked questions about Rifting Wrapped.</p>
                </header>

                <section className="policyBody">
                    {items.map((it, i) => (
                        <article key={i} className="policySection">
                            <h2>{it.q}</h2>
                            <p>{it.a}</p>
                        </article>
                    ))}
                </section>

            </main>
        </>
    );
}