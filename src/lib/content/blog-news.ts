import type { BlogPost } from "./blog-types";

export const BLOG_NEWS: BlogPost[] = [
  {
    slug: "zendesk-cx-trends-2026-analysis",
    title: "What Zendesk's 2026 CX Report Means for Product Teams",
    description:
      "Zendesk's 2026 CX Trends report shows 63% want more transparency and 85% of leaders link churn to unresolved issues. Here is the practical fix.",
    date: "2026-07-07",
    keyword: "customer feedback trends 2026",
    readMins: 7,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt:
      "Support team reviewing customer feedback trends 2026 data on a laptop screen",
    author: "Tom Whitfield, Feedlark co-founder",
    authorBio:
      "Tom co-founded Feedlark and writes about the practical side of building customer feedback into everyday product work.",
    category: "News",
    blocks: [
      {
        h2: "The report everyone in support is quoting",
        p: "Zendesk released its [2026 CX Trends report](https://cxtrends.zendesk.com/) this year, built from responses of more than 11,000 customer experience leaders and consumers across the world. It is the kind of report that support and product teams tend to skim once and then quote for the next twelve months. Two findings inside it deserve more than a skim, because together they describe a shift in what customers expect from the companies they pay.",
      },
      {
        h2: "Two numbers worth sitting with",
        p: "The first number is 63%. That is the share of customers who told Zendesk their demand for transparency from companies has risen compared with the year before. Not stayed the same, risen. Customers are not simply asking to be treated well, they are asking to see how decisions get made, why a feature is delayed, and what happens after they raise a problem.",
      },
      {
        p: "The second number is 85%. That is the share of CX leaders who say customers will drop a brand over an issue that goes unresolved, even when it was raised and dealt with on the first contact. Read that carefully. It is not only slow support that costs a company its customers. Leaders are saying that first-contact resolution is not enough on its own if the underlying issue never actually gets fixed, and the wider pattern lines up with [broader customer service research](https://blog.hubspot.com/service/customer-service-stats) showing that speed alone rarely satisfies a frustrated customer.",
      },
      {
        table: {
          caption: "Key figures from Zendesk's 2026 CX Trends report",
          head: ["Finding", "Figure", "What it signals"],
          rows: [
            [
              "Rising demand for transparency",
              "63% of customers",
              "Customers now expect visibility, not just good manners",
            ],
            [
              "Brand loyalty tied to unresolved issues",
              "85% of CX leaders",
              "First-contact resolution alone does not guarantee retention",
            ],
          ],
        },
      },
      {
        h2: "Why transparency became the ask",
        p: "It helps to ask why transparency, specifically, is the word customers are reaching for. A support ticket that gets closed quickly still leaves a gap if the customer never learns whether their underlying problem was actually addressed, or just papered over for that one conversation. Subscription pricing, endless app updates and public social feeds have trained people to expect a running commentary from the companies they use. When that commentary is missing, customers fill the silence with their own assumptions, and those assumptions are rarely generous.",
      },
      {
        p: "This is not really a support problem or a product problem on its own. It sits at the join between the two. Support teams hear the same complaint from ten different customers and have no natural place to say, we know, and here is what we are doing about it. Product teams fix the issue two months later with no way to tell the ten people who complained that their feedback mattered. The transparency gap opens up in that silence.",
      },
      {
        h2: 'What "unresolved" really means to a customer',
        p: 'The 85% figure is worth unpacking further, because "unresolved" rarely means a ticket stayed open forever. More often it means one of these:',
        ul: [
          "A bug got acknowledged but the customer never heard whether or when it was fixed.",
          "A feature request was noted politely and then vanished into an inbox.",
          "The same complaint kept surfacing across support tickets, reviews and sales calls, with no visible link back to a plan.",
          "A workaround was offered instead of a fix, and nobody followed up once the real fix shipped.",
        ],
      },
      {
        p: "None of these require a company to be careless. They just require a company to have no shared, visible record of what customers asked for and what happened next. That record is exactly what a [product feedback loop](/blog/what-is-a-product-feedback-loop) is meant to provide, and its absence is what turns a handled ticket into a lost customer six months later.",
      },
      {
        h2: "The practical answer: show your working",
        p: "Public roadmaps, open feedback boards and changelogs exist for exactly this gap. None of them are exotic ideas. A feedback board lets a customer see that their request was logged, not just heard. A [public roadmap](/blog/how-to-build-public-roadmap) shows where that request sits against everything else on the team's plate, so a not yet comes with context instead of silence. A changelog closes the loop by telling the person who originally asked, sometimes by name, that the thing they wanted has shipped.",
      },
      {
        p: "This is also why [closing the feedback loop](/blog/close-the-feedback-loop) matters more than opening it. Any company can collect requests. Fewer bother to tell customers what happened to them. Zendesk's transparency figure suggests that the second half, closing the loop in public, is now the part customers notice and remember. A well kept [changelog](/blog/changelog-best-practices) is one of the cheapest trust-building tools a product team has, because it turns internal engineering work into a visible, dated public record.",
      },
      {
        quote: {
          text: "Customers do not need every request granted. They need to see that requests go somewhere, and that somewhere is not a black hole.",
          cite: "Tom Whitfield, Feedlark co-founder",
        },
      },
      {
        h2: "A scenario worth recognising",
        p: "Picture a support team of around thirty people at a mid-sized SaaS company. Three or four times a week, someone raises the same complaint about a clunky export feature. Each ticket gets closed quickly and politely. Support metrics look fine, first-contact resolution is high, average handling time is short. But nobody outside support ever sees the pattern, because it lives in a ticket queue rather than anywhere product can act on it. Eight months later, a chunk of those customers quietly cancel, and the churn report shows reason: other for most of them. The problem was never really about the export feature. It was that thirty tickets never became one visible item on a roadmap that customers could watch and vote on.",
      },
      {
        p: "A public feedback board would have turned that pattern into a single, visible entry within the first week. Customers who raised it would have been able to see it logged, watch it move, and get notified the day it shipped. That is the difference between a resolved ticket and a resolved problem, and it is exactly the gap Zendesk's leaders are describing when they talk about brands losing customers over issues that were, technically, closed.",
      },
      {
        h2: "What this means for the next quarter",
        p: "None of this requires a company to publish everything or promise everything. Transparency, in the way Zendesk's respondents seem to mean it, is closer to a habit than a campaign. A few concrete steps matter more than a big announcement:",
        ul: [
          "Give customers one visible place to submit and track ideas, rather than scattering them across email, chat and social media.",
          'Show status. Even a plain "under review" or "planned" label reduces the silence that breeds assumptions.',
          "Publish a changelog every time something ships, and link it back to the requests that inspired it.",
          "Review the feedback board in the same meeting where support escalations get discussed, so both teams see the same pattern at the same time.",
        ],
      },
      {
        p: "None of these steps are complicated to set up. Tools built specifically for this, rather than repurposed spreadsheets or help desk tags, make the habit easier to sustain, which matters more than any single feature. The [best customer feedback tools](/blog/best-customer-feedback-tools) tend to succeed for exactly this reason: they make transparency the default output of work that was happening anyway, rather than a separate project nobody has time for.",
      },
      {
        h2: "Where this connects to retention",
        p: "Transparency and retention are not separate conversations. The same visible feedback loop that answers Zendesk's transparency finding also shows up as a lever in [SaaS churn benchmarks for 2026](/blog/saas-churn-benchmarks-2026-analysis), because customers who can see their problem being worked on are far less likely to cancel quietly. Treat the two reports as one story: what customers want to see, and what happens to revenue when they do not see it. The economics behind this are not new, [research on keeping the right customers](https://hbr.org/2014/10/the-value-of-keeping-the-right-customers) has long argued that retention pays for itself many times over. Transparency is simply the current, very visible version of that old argument.",
      },
    ],
    takeaways: [
      "Zendesk's 2026 CX Trends report finds 63% of customers want more transparency from companies than a year ago.",
      "85% of CX leaders say customers will leave over unresolved issues, even after fast first-contact resolution.",
      "Unresolved rarely means an open ticket. It usually means feedback vanished with no visible follow-up.",
      "Public roadmaps, feedback boards and changelogs turn a silent process into visible proof that requests go somewhere.",
    ],
    faqs: [
      {
        q: "What is Zendesk's 2026 CX Trends report based on?",
        a: "It draws on responses from more than 11,000 customer experience leaders and consumers worldwide, gathered by Zendesk and published as its [2026 CX Trends report](https://cxtrends.zendesk.com/). It covers a wide range of support and experience topics, and this piece focuses on its transparency findings.",
      },
      {
        q: "What does the 63% transparency figure actually measure?",
        a: "It measures the share of customers who say their demand for transparency from companies has increased compared with the previous year. It reflects a shift in expectation rather than a one-off complaint, which is why it is worth planning around rather than dismissing as noise.",
      },
      {
        q: "Does fast support resolution stop customers leaving?",
        a: "Not on its own. Zendesk found that 85% of CX leaders believe customers will still drop a brand over an issue that was never truly resolved, even if it was handled quickly on first contact. Speed helps, but customers also want to see the underlying problem addressed.",
      },
      {
        q: "How does a public roadmap actually improve transparency?",
        a: "A public roadmap shows customers where their request sits relative to everything else the team is working on, so a delay or a not yet comes with visible context instead of silence. Paired with a changelog, it closes the loop when the feature ships.",
      },
    ],
  },
  {
    slug: "saas-churn-benchmarks-2026-analysis",
    title: "What SaaS Churn Benchmarks for 2026 Mean for Retention",
    description:
      "Recurly's 2026 research puts average SaaS churn at 3.27%, with B2B logo churn near 3.5%. Here is what the benchmarks mean for retention teams.",
    date: "2026-07-08",
    keyword: "saas churn rate 2026",
    readMins: 7,
    image:
      "https://images.unsplash.com/photo-1590650046871-92c887180603?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt:
      "SaaS team analysing churn rate 2026 dashboard and retention metrics on screen",
    author: "Priya Shah, Head of Product at Feedlark",
    authorBio:
      "Priya leads product at Feedlark and writes about the link between feedback, retention and healthy churn benchmarks.",
    category: "News",
    blocks: [
      {
        h2: "The benchmark everyone will quote this year",
        p: "Recurly's 2026 research puts the average churn rate across subscription industries at 3.27%, drawn from real billing data rather than survey guesses. The same [Recurly churn rate benchmarks](https://recurly.com/research/churn-rate-benchmarks/) research splits that figure roughly evenly between voluntary churn, where a customer chooses to cancel, and involuntary churn, where a payment simply fails, with voluntary cancellations making up the larger share of the two.",
      },
      {
        p: "Alongside this sits a second, widely cited figure: a median annual logo churn rate for B2B SaaS companies of around 3.5%, a number that has circulated through industry commentary on Recurly's churn research for the past year and is worth treating as a rough, commonly used benchmark rather than an exact target to hit.",
      },
      {
        table: {
          caption: "Churn benchmarks worth knowing for 2026",
          head: ["Metric", "Figure", "Source"],
          rows: [
            [
              "Average churn rate, all subscription industries",
              "3.27%",
              "Recurly 2026 research",
            ],
            [
              "Split between voluntary and involuntary churn",
              "Roughly even, voluntary the larger share",
              "Recurly 2026 research",
            ],
            [
              "Median annual logo churn, B2B SaaS",
              "Around 3.5%",
              "Widely cited industry benchmark",
            ],
          ],
        },
      },
      {
        h2: "Why the voluntary and involuntary split matters",
        p: "The distinction between voluntary and involuntary churn matters because the two problems need almost completely different fixes. Involuntary churn, a card that expires or a payment that bounces, is largely a billing and dunning problem, solved with retry logic, updated card prompts and better payment processing. Voluntary churn, a customer actively deciding to leave, is a product and relationship problem, and it is the harder of the two to fix because it usually starts long before the cancellation button gets clicked.",
      },
      {
        p: "This is where the 3.27% average becomes more useful than it first looks. If a company's churn sits close to that average but most of it is voluntary, the fix is not a better checkout flow. It is understanding why customers are choosing to go, and that understanding rarely comes from the billing system on its own.",
      },
      {
        h2: "Silent churn is the expensive kind",
        p: 'Most voluntary churn is silent long before it becomes visible. A customer who is quietly frustrated does not usually email to complain. They stop logging in as often, they stop opening the product update emails, and then one day they cancel, often citing something vague like "no longer needed" on the exit survey. By the time that survey response lands, the actual reason, a missing feature, a clunky workflow, a competitor who shipped something first, is long gone from anyone\'s memory.',
      },
      {
        p: "This is the core problem with relying only on the cancellation screen to learn why customers leave. It is the last possible moment to learn anything, and by then there is nothing left to do for that particular customer. This lines up with long-standing [research on the economics of retention](https://hbr.org/2014/10/the-value-of-keeping-the-right-customers), which has shown for years that keeping an existing customer costs far less than winning a new one. A [customer feedback loop](/blog/what-is-a-product-feedback-loop) that runs continuously, rather than only at the exit door, catches the same frustration months earlier, while there is still a product decision left to make.",
      },
      {
        h2: "A scenario worth recognising",
        p: "Picture a 30-person SaaS support and success team that tracks its churn rate carefully every month. It sits close to the 3.27% average, nothing alarming on the surface. But underneath that average, a steady one percent of monthly cancellations mention the same missing integration, spread thinly across exit surveys, sales call notes and a handful of support tickets. No single person sees the whole pattern, because each conversation looks like an isolated, low-stakes complaint. It takes a full year of slow bleed before someone pulls the threads together, by which point the company has lost roughly the same number of customers it could have kept with a single roadmap entry and a public in progress label three months earlier.",
      },
      {
        p: "A visible feedback board would have surfaced that integration request as a single item with a growing vote count, visible to product, sales and support at the same time. Instead, the same signal arrived as noise, scattered across three systems that never talk to each other.",
      },
      {
        quote: {
          text: "Churn rarely arrives as a surprise. It arrives as a pattern nobody was watching in one place.",
          cite: "Priya Shah, Head of Product at Feedlark",
        },
      },
      {
        h2: "Turning a benchmark into an early warning system",
        p: "A churn benchmark like 3.27%, or the roughly 3.5% figure often quoted for B2B SaaS logo churn, is most useful as a comparison point, not a target to chase directly. Companies that try to push churn down through discounts or retention offers alone tend to shift the number briefly without changing the underlying reason customers were unhappy. The more durable approach is to make those reasons visible before they turn into a cancellation.",
      },
      {
        p: "A public [feature request board](/blog/how-to-track-feature-requests) does this by giving customers a place to say what they want before they get frustrated enough to leave quietly. A [product roadmap](/blog/how-to-build-public-roadmap) shows them their request has a home. A [changelog](/blog/changelog-best-practices), paired with a direct message telling customers a feature has shipped, closes the loop and gives them a concrete reason to stay for the next release too. None of this replaces good billing practices for the involuntary half of churn, but it directly answers the voluntary half, which Recurly's split suggests is the bigger share of the problem.",
      },
      {
        h2: "What to check this quarter",
        p: "A few practical checks help translate these benchmarks into action rather than just a slide in a board deck:",
        ul: [
          "Split your own churn number into voluntary and involuntary before comparing it with the 3.27% average, otherwise you are comparing two different problems with one figure.",
          "Look for repeated themes in cancellation reasons over the last two quarters, rather than treating each one as isolated.",
          "Check whether requests raised in support tickets ever make it onto a roadmap customers can see.",
          "Send a direct notification when a requested feature ships, rather than assuming customers will notice it in a general release note.",
        ],
      },
      {
        p: "None of this guarantees churn falls below the 3.5% benchmark often quoted for B2B SaaS logo churn. What it does is replace guesswork with a visible record, so the next cancellation conversation includes information the team already had, instead of a surprise nobody saw coming.",
      },
      {
        h2: "One churn number is a snapshot, not a trend",
        p: "A single monthly churn figure, even one as clean as 3.27%, tells you where you stand but not which direction you are heading. A more useful habit is tracking churn by cohort, comparing customers who joined this quarter against customers who joined a year ago, and watching whether the newer group churns faster or slower over time. A rising trend inside a cohort that used to look healthy is often the first sign that something has changed in the product or the wider market, well before the overall average moves enough for anyone to raise an alarm.",
      },
      {
        p: "This is where a visible feedback loop pays for itself twice over. It gives an early signal that something has shifted, and it gives a natural next step once that signal appears: look at what the affected cohort has actually been asking for on the feedback board, and check whether any of it ever reached the roadmap. If the answer is no, that gap is often the missing piece a churn number alone cannot show, and it is far cheaper to close it now than to explain it in next quarter's board deck.",
      },
      {
        h2: "Where this connects to transparency",
        p: "Retention and transparency turn out to be the same conversation from two different angles. The findings behind [Zendesk's 2026 CX Trends report](/blog/zendesk-cx-trends-2026-analysis) show customers now expect to see how companies handle their feedback, and Recurly's churn data shows what happens to revenue when that visibility is missing. A feedback board and a public roadmap answer both problems with the same piece of infrastructure, which is worth remembering the next time churn and support show up as separate line items on a dashboard.",
      },
    ],
    takeaways: [
      "Recurly's 2026 research puts average SaaS churn at 3.27%, split roughly evenly between voluntary and involuntary causes.",
      "A median B2B SaaS annual logo churn benchmark of around 3.5% is widely cited alongside Recurly's figures.",
      "Voluntary churn is the harder problem to fix and it is usually silent until the cancellation screen.",
      "A visible feedback loop, public roadmap and changelog turn silent frustration into an early warning system.",
    ],
    faqs: [
      {
        q: "What is the average SaaS churn rate in 2026?",
        a: "Recurly's 2026 research puts average churn at 3.27% across subscription industries, based on real billing data. That figure splits roughly evenly between voluntary and involuntary churn, with voluntary cancellations making up the larger share.",
      },
      {
        q: "What counts as a good B2B SaaS churn rate?",
        a: "There is no single right answer, but a median annual logo churn rate of around 3.5% is a commonly cited B2B SaaS benchmark alongside Recurly's figures. Treat it as a rough comparison point rather than a strict target, since churn varies a lot by pricing and customer size.",
      },
      {
        q: "What is the difference between voluntary and involuntary churn?",
        a: "Involuntary churn happens when a payment fails, for example an expired card, and is largely a billing problem. Voluntary churn happens when a customer actively decides to cancel, and it is usually a product or relationship problem that started well before the cancellation itself.",
      },
      {
        q: "How can a feedback board reduce SaaS churn?",
        a: "A public [feedback board](/blog/feature-request-board-guide) surfaces recurring frustrations while there is still time to act, rather than waiting for the cancellation screen. Paired with a visible roadmap and changelog, it gives customers a reason to stay for the next release instead of leaving quietly.",
      },
    ],
  },
];
