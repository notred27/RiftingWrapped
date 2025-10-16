import { useState } from "react";
import { Helmet } from 'react-helmet-async';

import "./FAQ.css"
const DEFAULT_FAQ = [
  {
    q: "What is Rifting Wrapped?",
    a: "Rifting Wrapped is your personalized yearly recap of your time on Rifting, highlighting your stats, achievements, and memorable moments. It started as a personal project, but is now expanding to let all users view their stats!"
  },
  {
    q: "Do I need an account?",
    a: "You don't need a permanent account to view your stats. Instead, when you search your account for the first time, it is added to a tracker so we can gather your public stats. No additional accounts are needed!"
  },
  {
    q: "How do you use my data?",
    a: "We only process public gameplay data available from Riot's API. This means that private matches and personal info about a user's account is not included in any data used by this app."
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
    q: "Can I share my Wrapped?",
    a: "Yes! Once your Wrapped is generated, you can copy your unique link to share directly on social media. After the link is shared, a personalized banner will appear with details about your highlights."
  },
  {
    q: "When is Rifting Wrapped updated?",
    a: "Rifting Wrapped is refreshed at the end of each year to give you a full picture of your season. Additionally, new matches are added on the hour to keep your current stats up to date."
  },
  {
    q: "What if my stats look wrong?",
    a: "Sometimes it takes a bit of time for new matches to be processed. Try refreshing later, and if it still looks off, check back in a day or two."
  },
  {
    q: "Why isn't my Wrapped loading?",
    a: "When your account is first added, it can take a while for your stats to initally load (up to an hour). Additionally, since we are currently using free services, it may take up to a minute for your stats to load in when first visiting the site. If your stats don't load after a few minutes, check your internet connection or try again later."
  },
  // { 
  //   q: "Can I remove my data?", 
  //   a: "Yes. You can request to have your account removed from our tracker at any time, just reach out via the support page." 
  // },
  {
    q: "Who is Rifting Wrapped for?",
    a: "It's for anyone who plays League of Legends and wants a fun breakdown of their activity over the past year."
  },
  {
    q: "Can I compare my Wrapped with friends?",
    a: "Yes! You can share your recap link and see how you stack up side by side with your friends."
  },
  // { 
  //   q: "How do I contact support?", 
  //   a: "You can reach us via the contact form on the site or by emailing support@riftingwrapped.com." 
  // }
];



export default function FAQ({ items = DEFAULT_FAQ }) {
  const [openIndex, setOpenIndex] = useState(null);


  return (


    <>
      <Helmet>
        <link rel="canonical" href={`https://master.d1t2tctgq2njxi.amplifyapp.com`} />
      </Helmet>

      <main className="faqContainer">
        <header className="faqHeader">
          <h1>FAQ</h1>
          <p className="faqSubtitle">Quick answers to common Rifting Wrapped questions.</p>
        </header>

        <section className="faqList" aria-live="polite">


          {items.map((it, i) => {
            const isOpen = openIndex === i;
            return (
              <article key={i} className={`faqItem ${isOpen ? "open" : ""}`}>
                <button
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="faqQBtn"
                  onClick={() => setOpenIndex((prev) => (prev === i ? null : i))}
                >
                  <span className="faqQText">{it.q}</span>
                  <span className="faqChevron" aria-hidden>
                  </span>
                </button>

                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className="faqPanel"
                >
                  <div className="faqPanelInner">
                    <p className="faqA">{it.a}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

      </main>


    </>
  );
}
