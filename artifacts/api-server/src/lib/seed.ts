import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Week 1 — Foundations of critical thinking
  {
    slug: "what-is-critical-thinking",
    title: "What critical thinking is and why it matters",
    weekNumber: 1,
    blurb: "Evaluating reasoning fairly; what it is, what it is not.",
    lectureTitle: "1.1 What critical thinking is and why it matters",
    body: `# What critical thinking is and why it matters

Critical thinking is the disciplined practice of *evaluating reasoning* — your own and others' — to decide what is reasonable to believe or do. It is not about being negative or clever; it is about being **fair, careful, and honest** with evidence and argument.

## What it is not

- It is **not** simply disagreeing or finding fault.
- It is **not** raw intelligence or knowing many facts.
- It is **not** winning arguments by any means available.

## The core moves

A critical thinker habitually asks four questions:

1. **What exactly is being claimed?**
2. **What reasons are offered?**
3. **Are those reasons true, and do they actually support the claim?**
4. **What's being assumed, and what's been left out?**

## Why it matters

We are flooded with claims — ads, headlines, posts, statistics, expert testimony. Critical thinking is the skill that separates what is worth believing from what merely sounds convincing. It protects you from manipulation by others and from your own biases.

## Metacognition

Critical thinking is partly **metacognition** — thinking about your own thinking. The strongest reasoners notice when they are confused, when they *want* something to be true, and when they have reasoned past the evidence.`,
  },
  {
    slug: "claims-beliefs-truth",
    title: "Claims, beliefs, and truth",
    weekNumber: 1,
    blurb: "The statement as the atom of reasoning; belief vs. truth.",
    lectureTitle: "1.2 Claims, beliefs, and truth",
    body: `# Claims, beliefs, and truth

The atom of reasoning is the **claim** (also called a *statement* or *proposition*): a sentence that is either true or false.

## Claims vs. non-claims

- "The Earth orbits the Sun." — a claim (and true).
- "Close the door." — a command, **not** a claim.
- "What time is it?" — a question, **not** a claim.
- "Ouch!" — an exclamation, **not** a claim.

Only claims can serve as premises or conclusions, because only claims can be true or false.

## Belief vs. truth

A **belief** is a claim you accept. **Truth** is whether the claim matches reality. These two come apart: you can believe something false, and something can be true that you do not believe. Critical thinking is the work of bringing your beliefs closer to the truth.

## Facts vs. opinions

The fact/opinion split is rougher than people think. "Chocolate is tasty" reports a preference. But "Vaccines cause autism" is sometimes *called* an opinion when it is really a **false factual claim**. Ask: is this about a *preference*, or about *how the world is*?`,
  },
  {
    slug: "arguments-vs-nonarguments",
    title: "Arguments vs. non-arguments",
    weekNumber: 1,
    blurb: "An argument supports a claim; descriptions and explanations do not.",
    lectureTitle: "1.3 Arguments vs. non-arguments",
    body: `# Arguments vs. non-arguments

In critical thinking, an **argument** is not a quarrel. It is a set of claims in which some (the *premises*) are offered as reasons to accept another (the *conclusion*).

## The test for an argument

Ask: **is something being supported by something else?** If yes, it is an argument. If the passage merely reports, describes, explains, or illustrates without trying to *prove* a point, it is a non-argument.

## Common non-arguments

- **Description:** "The room was cold and dark."
- **Explanation:** "The bridge collapsed because the steel had rusted." (tells *why*, not *that*)
- **Report:** "Officials announced the new policy yesterday."
- **Illustration:** "Many metals conduct electricity; copper, for example."

## Argument vs. explanation

This is the hardest distinction. An **argument** tries to convince you *that* something is true. An **explanation** assumes you already accept it and tells you *why* it happened. Same grammar, different job — look at whether the conclusion is genuinely in doubt.`,
  },
  {
    slug: "premises-and-conclusions",
    title: "Premises and conclusions",
    weekNumber: 1,
    blurb: "The two parts of every argument and the words that flag them.",
    lectureTitle: "1.4 Premises and conclusions",
    body: `# Premises and conclusions

Every argument has two parts: **premises** (the reasons) and a **conclusion** (the claim the reasons support).

## Indicator words

Certain words flag each part:

- **Conclusion indicators:** *therefore, so, thus, hence, consequently, it follows that.*
- **Premise indicators:** *because, since, for, given that, as, on the grounds that.*

"**Since** the streets are wet, it must have rained." — "since" flags the premise (streets are wet); the conclusion is "it rained."

## Watch the order

Conclusions can come first, last, or in the middle: "We should leave now, because the storm is coming." Here the conclusion ("we should leave now") is stated first.

## No indicators?

Many arguments use no indicator words at all. Then you ask the key question: **which claim is the author trying to get me to accept, and which claims are doing the supporting?**`,
  },
  {
    slug: "identifying-reconstructing-arguments",
    title: "Identifying and reconstructing arguments",
    weekNumber: 1,
    blurb: "Pulling a clean argument out of messy prose; implicit premises.",
    lectureTitle: "1.5 Identifying and reconstructing arguments",
    body: `# Identifying and reconstructing arguments

Real arguments are messy — buried in prose, padded with repetition, missing pieces. **Reconstructing** an argument means restating it clearly as premises and a conclusion.

## Steps

1. Find the **conclusion** (the main point).
2. Find the stated **premises**.
3. Strip out noise — repetition, asides, rhetorical questions.
4. Supply any **implicit (unstated) premise** the argument needs.

## Implicit premises

Most everyday arguments leave assumptions unstated. "Socrates is a man, so Socrates is mortal" relies on the missing premise **"All men are mortal."** An argument with a suppressed premise is called an *enthymeme*. Surfacing the hidden premise is often where the real evaluation begins — because the hidden premise is frequently the weak one.

## Be accurate first

Reconstruct what the author *actually* argued before you judge it. Adding a premise to make the argument work is fair; adding one to make it look foolish is not.`,
  },
  {
    slug: "diagramming-arguments",
    title: "Diagramming argument structure",
    weekNumber: 1,
    blurb: "Mapping how premises combine: linked, convergent, and serial.",
    lectureTitle: "1.6 Diagramming argument structure",
    body: `# Diagramming argument structure

Once an argument has several premises, a **diagram** shows how they fit together. Number each claim, then map the support with arrows pointing to what each claim supports.

## Linked premises

Premises are **linked** when they work only *together* — remove one and the support collapses.

> (1) All mammals are warm-blooded. (2) Whales are mammals. Therefore (3) whales are warm-blooded.

Neither (1) nor (2) alone supports (3); they are linked: (1)+(2) → (3).

## Convergent premises

Premises are **convergent** when each independently supports the conclusion.

> (1) The restaurant is cheap. (2) It is close by. Therefore (3) we should eat there.

Either reason stands on its own: (1) → (3) and (2) → (3).

## Serial structure

A claim can be the conclusion of one step and a premise of the next: (1) → (2) → (3). Diagrams make these chains — and any gaps in them — visible.`,
  },
  {
    slug: "standardizing-charity",
    title: "Standardizing and charitable interpretation",
    weekNumber: 1,
    blurb: "Writing arguments in standard form; the principle of charity.",
    lectureTitle: "1.7 Standardizing and charitable interpretation",
    body: `# Standardizing and charitable interpretation

**Standardizing** is rewriting an argument as a clean, numbered list of premises followed by the conclusion — the canonical form for analysis.

## Standard form

> P1. If it is raining, the game is canceled.
> P2. It is raining.
> C. Therefore, the game is canceled.

Every premise on its own line; the conclusion marked clearly. Standard form removes ambiguity about what supports what.

## The principle of charity

When an argument is unclear or could be read several ways, interpret it in its **strongest reasonable form**. Do not defeat a weak version the author never intended.

## The straw man warning

Violating charity produces the **straw man**: attacking a distorted, weaker version of someone's position. Charity is both an intellectual virtue and a practical safeguard — if you refute the strongest version, your conclusion is secure; if you only beat a straw man, you have proven nothing.`,
  },

  // Week 2 — Logic and reasoning
  {
    slug: "deductive-vs-inductive",
    title: "Deductive vs. inductive reasoning",
    weekNumber: 2,
    blurb: "Certainty vs. probability: the two great families of argument.",
    lectureTitle: "2.1 Deductive vs. inductive reasoning",
    body: `# Deductive vs. inductive reasoning

Arguments come in two great families, distinguished by **how much support** the premises are meant to give the conclusion.

## Deductive

A **deductive** argument aims for *certainty*: if the premises are true, the conclusion **must** be true. The support is all-or-nothing.

> All humans are mortal. Socrates is human. Therefore Socrates is mortal.

## Inductive

An **inductive** argument aims for *probability*: if the premises are true, the conclusion is **likely**, but not guaranteed.

> Every swan observed so far has been white. So the next swan will be white.

Strong inductive arguments can still have true premises and a false conclusion — as the discovery of black swans showed.

## Telling them apart

Ask: **does the arguer intend the conclusion to follow necessarily, or only probably?** That intention — not the topic — decides which standards (validity vs. strength) you apply.`,
  },
  {
    slug: "validity-and-soundness",
    title: "Validity and soundness",
    weekNumber: 2,
    blurb: "Form vs. truth: the two terms students confuse most.",
    lectureTitle: "2.2 Validity and soundness",
    body: `# Validity and soundness

These two terms apply to **deductive** arguments and are constantly confused.

## Validity

An argument is **valid** when its *form* guarantees the conclusion: *if* the premises were true, the conclusion *could not* be false. Validity is about structure, not facts.

> All cats are reptiles. Socrates is a cat. Therefore Socrates is a reptile.

This is **valid** — and has false premises. Validity ignores whether the premises are actually true.

## Soundness

An argument is **sound** when it is **valid AND all its premises are true**. Only sound arguments establish their conclusions.

## The combinations

- Valid + all true premises = **sound**; conclusion guaranteed true.
- Valid + a false premise = unsound; conclusion may be true or false.
- Invalid = unsound regardless of the premises.

A valid argument can have a false conclusion (when a premise is false). A *sound* one cannot.`,
  },
  {
    slug: "categorical-logic-syllogism",
    title: "Categorical logic and the syllogism",
    weekNumber: 2,
    blurb: "Reasoning about classes with All / No / Some statements.",
    lectureTitle: "2.3 Categorical logic and the syllogism",
    body: `# Categorical logic and the syllogism

**Categorical logic** reasons about classes of things using four statement forms:

- **A:** All S are P.
- **E:** No S are P.
- **I:** Some S are P.
- **O:** Some S are not P.

## The categorical syllogism

A **syllogism** draws a conclusion from two categorical premises that share a middle term.

> All mammals are animals. All dogs are mammals. Therefore all dogs are animals. (**valid**)

## Validity by form

Validity depends only on the arrangement of terms. This form is invalid:

> All cats are animals. All dogs are animals. Therefore all dogs are cats.

Both premises are true and the conclusion false — so the *form* itself is broken.

## Venn diagrams

Three overlapping circles let you test any syllogism: diagram the premises, then check whether the conclusion is already forced. If you must add anything to make it true, the syllogism is invalid.`,
  },
  {
    slug: "propositional-logic-truth-tables",
    title: "Propositional logic and truth tables",
    weekNumber: 2,
    blurb: "Connectives, the conditional, and the formal fallacies.",
    lectureTitle: "2.4 Propositional logic and truth tables",
    body: `# Propositional logic and truth tables

**Propositional logic** combines whole statements with connectives:

- $\\neg P$ — not $P$
- $P \\wedge Q$ — $P$ and $Q$
- $P \\vee Q$ — $P$ or $Q$
- $P \\to Q$ — if $P$ then $Q$

## The conditional

$P \\to Q$ is **false only when $P$ is true and $Q$ is false.** "If you mow the lawn, I'll pay you" is broken only if you mow *and* I do not pay.

## Valid forms

- **Modus ponens:** $P \\to Q$, $P$, therefore $Q$. ✓
- **Modus tollens:** $P \\to Q$, $\\neg Q$, therefore $\\neg P$. ✓

## Formal fallacies

- **Affirming the consequent:** $P \\to Q$, $Q$, therefore $P$. ✗
- **Denying the antecedent:** $P \\to Q$, $\\neg P$, therefore $\\neg Q$. ✗

A **truth table** lists every combination of truth values and settles validity mechanically: an argument is valid if no row makes the premises true while the conclusion is false.`,
  },
  {
    slug: "inductive-strength-generalization",
    title: "Inductive strength and generalization",
    weekNumber: 2,
    blurb: "What makes a sample-to-population inference strong or weak.",
    lectureTitle: "2.5 Inductive strength and generalization",
    body: `# Inductive strength and generalization

Inductive arguments are not valid or invalid — they are **strong** or **weak**, by degree.

## Inductive generalization

The most common inductive move infers a claim about a whole population from a sample:

> 800 of 1,000 surveyed voters favor the measure, so about 80% of all voters do.

## What makes it strong

- **Sample size:** larger samples support firmer conclusions.
- **Representativeness:** the sample must mirror the population.
- **Random selection:** guards against hidden bias.

## Hasty generalization

Drawing a sweeping conclusion from a sample that is **too small or unrepresentative** is the *hasty generalization*. "My two friends who smoke are healthy, so smoking is harmless" generalizes from a tiny, biased sample.

## Biased samples

A poll hosted on a finance website over-represents the wealthy. Even a huge sample is worthless if it is systematically skewed.`,
  },
  {
    slug: "analogical-reasoning",
    title: "Analogical reasoning",
    weekNumber: 2,
    blurb: "Arguing from similarity — and when the analogy breaks down.",
    lectureTitle: "2.6 Analogical reasoning",
    body: `# Analogical reasoning

An **argument from analogy** concludes that because two things are alike in some respects, they are probably alike in another.

> A new drug cured the disease in mice; mice and humans are physiologically similar; so it may cure the disease in humans.

## Evaluating an analogy

The argument is stronger when:

- The cases share **many** similarities.
- The similarities are **relevant** to the conclusion.
- There are **few relevant differences (disanalogies)**.
- The conclusion is **modest** relative to the similarities.

## Relevance is key

Surface similarities do not help. Mice and humans sharing a *hairless* trait is irrelevant to drug response; shared *metabolism* is highly relevant.

## False analogy

A **false analogy** rests on similarities that are superficial or irrelevant, or it ignores a crucial difference. "Running a country is just like running a business" breaks down because citizens are not customers and governments do not seek profit.`,
  },
  {
    slug: "causal-reasoning-mills-methods",
    title: "Causal reasoning and Mill's methods",
    weekNumber: 2,
    blurb: "Inferring causes, and why correlation is not causation.",
    lectureTitle: "2.7 Causal reasoning and Mill's methods",
    body: `# Causal reasoning and Mill's methods

Establishing that A **causes** B is among the hardest reasoning tasks. John Stuart Mill described systematic methods for inferring causes.

## Mill's methods

- **Method of Agreement:** if every case of the effect shares one prior factor, that factor is a likely cause.
- **Method of Difference:** if two cases differ in only one factor and only one shows the effect, that factor is the likely cause.
- **Joint Method:** combine agreement and difference.
- **Method of Concomitant Variation:** when the candidate cause varies, the effect varies in step.

## Correlation is not causation

Two things moving together may share a **common cause** (ice-cream sales and drownings both rise with summer heat) or be pure coincidence.

## Confounding

A **confounder** is a hidden third variable that influences both. The remedy is a **controlled experiment**: change one factor, hold everything else fixed, and watch the effect.`,
  },

  // Week 3 — Fallacies, bias, and rhetoric
  {
    slug: "fallacies-of-relevance",
    title: "Informal fallacies of relevance",
    weekNumber: 3,
    blurb: "Premises that persuade but are logically beside the point.",
    lectureTitle: "3.1 Informal fallacies of relevance",
    body: `# Informal fallacies of relevance

A **fallacy of relevance** offers premises that are psychologically persuasive but logically beside the point.

## Common types

- **Ad hominem:** attacking the person rather than their argument. "Don't trust her climate data — she drives an SUV."
- **Straw man:** distorting an opponent's view to attack it more easily.
- **Appeal to force (ad baculum):** backing a claim with a threat.
- **Appeal to pity (ad misericordiam):** substituting sympathy for evidence.
- **Red herring:** changing the subject to a distracting but irrelevant issue.
- **Appeal to the people (ad populum):** "everyone believes it, so it must be true."

## Why they work

Each swaps a real reason for an emotional or social pressure. The test is always the same: **does this premise actually bear on whether the conclusion is true?** If it only bears on how we *feel*, it is a fallacy of relevance.`,
  },
  {
    slug: "fallacies-weak-induction",
    title: "Fallacies of weak induction",
    weekNumber: 3,
    blurb: "Relevant premises that are simply too weak to support the claim.",
    lectureTitle: "3.2 Fallacies of weak induction",
    body: `# Fallacies of weak induction

Here the premises *are* relevant, but they are **too weak** to support the conclusion.

## Common types

- **Hasty generalization:** a conclusion drawn from too small or biased a sample.
- **Post hoc ergo propter hoc:** "A happened before B, so A caused B."
- **Slippery slope:** claiming one small step inevitably leads to an extreme outcome, with no support for each link.
- **Weak analogy:** an analogy resting on irrelevant similarities.
- **Appeal to ignorance (ad ignorantiam):** "No one has proven it false, so it is true."
- **Appeal to unqualified authority:** citing a celebrity or non-expert.

## The common thread

The reasoning *points* in the right direction but does not travel far enough. Post hoc, for example, mistakes mere sequence for causation — the rooster crows before sunrise, but does not cause it.`,
  },
  {
    slug: "fallacies-presumption-ambiguity",
    title: "Fallacies of presumption and ambiguity",
    weekNumber: 3,
    blurb: "Smuggled assumptions and slippery, shifting language.",
    lectureTitle: "3.3 Fallacies of presumption and ambiguity",
    body: `# Fallacies of presumption and ambiguity

These fallacies smuggle in an unwarranted assumption or exploit slippery language.

## Fallacies of presumption

- **Begging the question (circular reasoning):** the conclusion is hidden among the premises. "The Bible is true because it is the word of God, which we know because the Bible says so."
- **Complex (loaded) question:** a question presupposing something unproven. "Have you stopped cheating on tests?"
- **False dilemma:** presenting only two options when more exist. "Either we ban it entirely or we have chaos."
- **Suppressed evidence:** ignoring relevant facts that undercut the conclusion.

## Fallacies of ambiguity

- **Equivocation:** shifting a key word's meaning mid-argument. "Nothing is better than happiness; a cheese sandwich is better than nothing; so a sandwich is better than happiness."
- **Amphiboly:** ambiguity arising from grammar or sentence structure.

The cure for ambiguity is **defining your terms** and holding their meaning fixed throughout.`,
  },
  {
    slug: "rhetoric-persuasion-spin",
    title: "Rhetoric, persuasion, and spin",
    weekNumber: 3,
    blurb: "Persuasive force vs. logical force, and how spin exploits the gap.",
    lectureTitle: "3.4 Rhetoric, persuasion, and spin",
    body: `# Rhetoric, persuasion, and spin

**Rhetoric** is the art of persuasion. It is not inherently bad — but persuasive force and logical force are different things, and **spin** exploits the gap between them.

## Rhetorical devices

- **Euphemism / dysphemism:** softening ("collateral damage") or harshening ("baby-killing") language to steer feeling.
- **Loaded (emotive) language:** word choices that carry judgment — "freedom fighter" vs. "terrorist."
- **Weasel words:** vague qualifiers — "studies suggest," "up to," "may help."
- **Innuendo:** implying a claim without actually stating it.

## Spin

**Spin** presents facts selectively to create a misleading impression while remaining technically accurate.

## The defense

Separate the **content** of a claim from its **packaging**. Restate the claim in plain, neutral words and ask whether the *evidence* still supports it. If the persuasive power vanishes once the loaded language is gone, it was rhetoric, not reason.`,
  },
  {
    slug: "cognitive-biases-motivated-reasoning",
    title: "Cognitive biases and motivated reasoning",
    weekNumber: 3,
    blurb: "Systematic mental errors and reasoning driven by what we want.",
    lectureTitle: "3.5 Cognitive biases and motivated reasoning",
    body: `# Cognitive biases and motivated reasoning

Even careful reasoners are pushed off course by **cognitive biases** — systematic errors in how the mind processes information.

## Common biases

- **Confirmation bias:** seeking and favoring evidence that supports what you already believe.
- **Anchoring:** over-relying on the first number or fact you encounter.
- **Availability heuristic:** judging probability by how easily examples come to mind (plane crashes feel common because they are vivid).
- **Sunk cost fallacy:** continuing something because of past investment.
- **Dunning–Kruger effect:** the least skilled overestimating their competence.

## Motivated reasoning

**Motivated reasoning** is biased thinking driven by what we *want* to be true. We apply harsh scrutiny to unwelcome claims and wave the welcome ones through.

## Defenses

Actively seek **disconfirming** evidence, consider the opposite, separate your identity from your beliefs, and welcome being shown wrong. The first bias to watch for is the conviction that *you* are unbiased.`,
  },
  {
    slug: "language-definition-vagueness",
    title: "Language, definition, and vagueness",
    weekNumber: 3,
    blurb: "Ambiguity vs. vagueness; kinds of definitions; verbal disputes.",
    lectureTitle: "3.6 Language, definition, and vagueness",
    body: `# Language, definition, and vagueness

Clear reasoning needs clear language. Two failures recur: **ambiguity** and **vagueness**.

## Ambiguity vs. vagueness

- **Ambiguous:** a term has *multiple distinct meanings*. "bank" (riverside or financial).
- **Vague:** a term has *fuzzy borders*. "tall," "rich," "soon" — there is no sharp line.

## Kinds of definition

- **Lexical:** reports standard usage (a dictionary definition).
- **Stipulative:** assigns a meaning for the discussion at hand.
- **Précising:** sharpens a vague term for a purpose ("adult = 18 or older").
- **Persuasive:** slips an evaluation into a definition ("abortion is the murder of an innocent").

## Why it matters

Many disputes are **merely verbal** — people using the same word for different things, or arguing over where to draw a vague line. Before debating whether a hot dog is a sandwich, agree on what "sandwich" means.`,
  },
  {
    slug: "credibility-sources-testimony",
    title: "Credibility, sources, and testimony",
    weekNumber: 3,
    blurb: "Judging the people and sources we rely on for what we know.",
    lectureTitle: "3.7 Credibility, sources, and testimony",
    body: `# Credibility, sources, and testimony

Most of what we know comes from **testimony** — other people's claims. Evaluating sources is a core critical-thinking skill.

## Judging a source

- **Expertise:** is the source genuinely qualified *in this field*?
- **Bias / conflict of interest:** does the source gain from your belief?
- **Track record:** has the source been reliable before?
- **Corroboration:** do independent sources agree?
- **Primary vs. secondary:** is this firsthand, or a report of a report?

## Appeal to authority — good and bad

Trusting a **qualified** expert within their field is reasonable. The fallacy is the **appeal to inappropriate authority**: citing a celebrity, a non-expert, or an expert speaking outside their specialty.

## Lateral reading

Do not evaluate a source by staring at the source itself. **Read laterally:** open new tabs and check what *other* independent, credible sources say about it. This is how professional fact-checkers work.`,
  },

  // Week 4 — Applied reasoning and capstone
  {
    slug: "probability-statistical-reasoning",
    title: "Probability and statistical reasoning",
    weekNumber: 4,
    blurb: "Thinking in degrees; base rates; how statistics mislead.",
    lectureTitle: "4.1 Probability and statistical reasoning",
    body: `# Probability and statistical reasoning

Good critical thinking is **probabilistic** — most claims are matters of degree, not certainty.

## Basic rules

- A probability is a number in $[0, 1]$.
- $P(\\text{not } A) = 1 - P(A)$.
- For independent events, $P(A \\text{ and } B) = P(A) \\cdot P(B)$.

## The base rate

The **base rate** is how common something is to begin with. Ignoring it is the **base rate fallacy**: a test that is "99% accurate" for a disease only 1 in 10,000 people have will still flag mostly *healthy* people, because the healthy vastly outnumber the sick.

## How statistics mislead

- **Misleading averages:** a mean dragged by outliers; ask for the median.
- **Cherry-picked baselines:** "up 40% since [a conveniently chosen low point]."
- **Relative vs. absolute risk:** "doubles your risk" — from 1 in a million to 2 in a million.

Always ask: *out of how many, and compared to what?*`,
  },
  {
    slug: "evaluating-evidence-science",
    title: "Evaluating evidence and scientific claims",
    weekNumber: 4,
    blurb: "Falsifiability, the evidence hierarchy, and pseudoscience red flags.",
    lectureTitle: "4.2 Evaluating evidence and scientific claims",
    body: `# Evaluating evidence and scientific claims

Science is our most reliable method for testing claims about the world — once its standards are understood.

## Hallmarks of good evidence

- **Falsifiability:** a genuine claim rules something out; an *unfalsifiable* claim ("an invisible, undetectable dragon") predicts nothing.
- **Controlled comparison:** experiments isolate the variable of interest.
- **Replication:** results that cannot be reproduced are provisional.
- **Peer review:** scrutiny by other experts — helpful, though not a guarantee.

## The hierarchy of evidence

Anecdotes < case studies < observational studies < randomized controlled trials < systematic reviews. A single dramatic story is the weakest evidence, however compelling.

## Red flags of pseudoscience

Unfalsifiable claims, reliance on testimonials, conspiracy framing ("they don't want you to know"), no peer review, and immunity to any disconfirming evidence. Extraordinary claims require extraordinary evidence.`,
  },
  {
    slug: "decision-making-uncertainty",
    title: "Decision-making under uncertainty",
    weekNumber: 4,
    blurb: "Expected value, risk, and the traps that derail good choices.",
    lectureTitle: "4.3 Decision-making under uncertainty",
    body: `# Decision-making under uncertainty

Reasoning is not only about what is *true* — it is about what to *do* when outcomes are uncertain.

## Expected value

The **expected value** of an option is each outcome's value weighted by its probability, then summed.

> A \\$1 lottery ticket pays \\$1,000,000 with probability 1 in 10,000,000. Expected value $= \\frac{1{,}000{,}000}{10{,}000{,}000} = \\$0.10$ — far less than the \\$1 cost.

## Rational choice

Compare options by expected value, but also weigh your **risk tolerance**: a guaranteed \\$50 may beat a coin-flip for \\$110 if you cannot afford to lose.

## Common traps

- **Sunk cost:** basing choices on unrecoverable past costs.
- **Loss aversion:** weighting losses more heavily than equal gains.
- **Neglecting opportunity cost:** ignoring what you give up by choosing.

A decision should be judged by the **quality of reasoning given what you knew**, not only by how it happened to turn out.`,
  },
  {
    slug: "moral-value-reasoning",
    title: "Moral and value reasoning",
    weekNumber: 4,
    blurb: "The is–ought gap and the structure of moral arguments.",
    lectureTitle: "4.4 Moral and value reasoning",
    body: `# Moral and value reasoning

Not all reasoning is about facts. **Value reasoning** concerns what is good, right, or ought to be done.

## Is vs. ought

- A **descriptive (factual)** claim says how the world *is*: "Capital punishment does not reduce crime."
- A **normative (value)** claim says how it *ought* to be: "Capital punishment is wrong."

You cannot derive an *ought* from an *is* alone — this is the **is–ought gap**. A moral argument needs at least one value premise.

## Structure of moral arguments

> P1. (Value) Causing unnecessary suffering is wrong.
> P2. (Fact) This practice causes unnecessary suffering.
> C. Therefore this practice is wrong.

Evaluate both kinds of premise: are the facts right, *and* is the value principle defensible?

## Tools

Test value claims with **consistency** (would you accept it applied to you?), **counterexamples**, and **thought experiments**. Moral reasoning can be rigorous even without mathematical certainty.`,
  },
  {
    slug: "reasoning-in-writing",
    title: "Reasoning in writing and argumentative essays",
    weekNumber: 4,
    blurb: "Thesis, structure, counterarguments, and signposting.",
    lectureTitle: "4.5 Reasoning in writing and argumentative essays",
    body: `# Reasoning in writing and argumentative essays

Writing is reasoning made visible. An **argumentative essay** defends a claim with structured support.

## The thesis

The **thesis** is the single main claim the whole essay defends. It should be specific, contestable, and clear. "Social media harms teen mental health and should be age-restricted" is a thesis; "Social media is interesting" is not.

## Structure

1. **Introduction** that states the thesis.
2. **Body paragraphs**, each a premise: claim, evidence, reasoning.
3. **Counterarguments** acknowledged and answered.
4. **Conclusion** that the body has earned.

## Addressing objections

A strong essay states the **strongest opposing view** (charitably) and responds to it. Ignoring obvious objections signals weak reasoning.

## Signposting

Use premise and conclusion indicators — *because, therefore, however, nevertheless* — so the reader can follow the logical skeleton. If you cannot outline your essay as premises and a conclusion, the argument is not finished.`,
  },
  {
    slug: "detecting-misinformation",
    title: "Detecting misinformation and manipulation",
    weekNumber: 4,
    blurb: "Warning signs and verification techniques for the online world.",
    lectureTitle: "4.6 Detecting misinformation and manipulation",
    body: `# Detecting misinformation and manipulation

Misinformation is false or misleading content; **disinformation** is misinformation spread deliberately. Both thrive online.

## Warning signs

- **Emotional bait:** content engineered to provoke outrage or fear.
- **Missing or vague sourcing:** "experts say," with no link and no name.
- **Manipulated context:** a real photo or quote ripped from its setting.
- **Too good (or bad) to be true:** it confirms your side perfectly.

## Techniques

- **Lateral reading:** leave the page and check independent sources.
- **Check the original:** trace a claim back to its primary source.
- **Reverse image search:** verify when and where an image really came from.
- **Consider the incentive:** who benefits if you believe and share this?

## Defenses

Slow down before sharing — virality exploits speed. Distinguish a **headline** from the **evidence**. And apply the same scrutiny to content you *agree* with, because that is exactly where your guard is lowest.`,
  },
  {
    slug: "critical-thinking-across-domains",
    title: "Applying critical thinking across domains",
    weekNumber: 4,
    blurb: "How reasoning takes a different shape in each field — and transfers.",
    lectureTitle: "4.7 Applying critical thinking across domains",
    body: `# Applying critical thinking across domains

Critical thinking is a **general** skill, but it takes a different shape in each domain.

## Domain by domain

- **Health:** weigh relative vs. absolute risk; separate correlation from causation in studies.
- **Politics:** watch for loaded language, false dilemmas, and tribal motivated reasoning.
- **Personal finance:** beware sunk costs, base-rate neglect, and "get rich quick" appeals.
- **Science news:** a single study is not settled science; check for replication.
- **Everyday life:** notice when a salesperson frames a false dilemma or anchors a price.

## Transfer

The hard part is **transfer** — using a skill learned in one context in a new one. It does not happen automatically; you build it by deliberately asking the core questions everywhere: *What is the claim? What is the evidence? What is assumed? What is left out?*

## The habit

Expertise in a field does not immunize anyone against fallacies. The goal is to make critical questioning a reflex, not a special occasion.`,
  },
  {
    slug: "capstone-synthesis",
    title: "Capstone synthesis",
    weekNumber: 4,
    blurb: "Putting the whole toolkit to work on a real-world claim.",
    lectureTitle: "4.8 Capstone synthesis",
    body: `# Capstone synthesis

The capstone ties the whole course together: take a real claim from the wild and evaluate it end to end.

## A worked example

> "A new study shows students who use our app score 20% higher. Don't let your child fall behind — the data doesn't lie."

Apply the toolkit:

1. **Identify the argument** — conclusion: buy the app; premises: the study and the appeal.
2. **Classify the reasoning** — inductive, from a study to a recommendation.
3. **Check the evidence** — sample size? control group? who funded it? 20% relative to what?
4. **Spot fallacies and rhetoric** — appeal to fear ("fall behind"), the "data doesn't lie" thought-stopper, post hoc risk.
5. **Consider bias** — the seller's conflict of interest; your own hope that it works.
6. **Reach a verdict** — proportion your belief to the strength of the evidence.

## The standard

A claim is worth believing when the **premises are true** and the **reasoning is valid or strong**. That single test — applied honestly, to friend and foe alike — is critical thinking.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  // Week 1
  {
    kind: "homework",
    title: "Homework 1.1 — Claims and arguments",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice. Explain your reasoning in the answer box.",
    problems: [
      { topicSlug: "what-is-critical-thinking", prompt: "True or false: critical thinking means criticizing or rejecting other people's views.", correctAnswer: "false", explanation: "Critical thinking is fair evaluation of reasoning, not mere fault-finding." },
      { topicSlug: "claims-beliefs-truth", prompt: "A sentence that is either true or false (it has a truth value) is called a ____. One word.", correctAnswer: "claim", explanation: "A claim (statement/proposition) is the bearer of truth or falsity." },
      { topicSlug: "arguments-vs-nonarguments", prompt: "'You should exercise because it lowers your risk of heart disease.' Is this an argument or a non-argument?", correctAnswer: "argument", explanation: "A reason ('because...') is offered to support a conclusion, so it is an argument." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Structure of arguments",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "premises-and-conclusions", prompt: "In 'All dogs are mammals, so Rex is a mammal,' the word 'so' signals the ____.", correctAnswer: "conclusion", explanation: "'So' is a conclusion indicator." },
      { topicSlug: "identifying-reconstructing-arguments", prompt: "An unstated assumption an argument needs in order to work is called a missing or ____ premise. One word.", correctAnswer: "implicit", explanation: "Also called an unstated or suppressed premise; such an argument is an enthymeme." },
      { topicSlug: "diagramming-arguments", prompt: "When two premises support a conclusion only by working together (neither suffices alone), the support is called ____.", correctAnswer: "linked", explanation: "Linked premises depend on each other; remove one and the support collapses." },
      { topicSlug: "standardizing-charity", prompt: "Interpreting an argument in its strongest, most reasonable form is called the principle of ____.", correctAnswer: "charity", explanation: "The principle of charity guards against the straw man." },
    ],
  },
  {
    kind: "test",
    title: "Week 1 Test",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions: "Timed. 30 minutes. Pasting is disabled.",
    problems: [
      { topicSlug: "claims-beliefs-truth", prompt: "'Close the door.' Does this sentence express a claim (a true/false bearer)? Answer yes or no.", correctAnswer: "no", explanation: "It is a command, which is neither true nor false." },
      { topicSlug: "arguments-vs-nonarguments", prompt: "A passage that merely tells you WHY an accepted fact happened, without trying to prove it, is an argument or an explanation?", correctAnswer: "explanation", explanation: "An explanation assumes the fact and gives its cause; it does not argue that it is true." },
      { topicSlug: "premises-and-conclusions", prompt: "In 'The streets are wet, so it rained,' which clause is the conclusion? Two words.", correctAnswer: "it rained", explanation: "'So' marks 'it rained' as the conclusion." },
      { topicSlug: "premises-and-conclusions", prompt: "Name one common conclusion-indicator word.", correctAnswer: "therefore", explanation: "Therefore, so, thus, hence, and consequently all indicate conclusions." },
      { topicSlug: "diagramming-arguments", prompt: "When several independent premises each separately support the same conclusion, the structure is called ____.", correctAnswer: "convergent", explanation: "Each convergent premise supports the conclusion on its own." },
      { topicSlug: "what-is-critical-thinking", prompt: "Thinking about and monitoring your own thinking is called ____ (one word beginning 'meta').", correctAnswer: "metacognition", explanation: "Metacognition is awareness and regulation of one's own reasoning." },
    ],
  },

  // Week 2
  {
    kind: "homework",
    title: "Homework 2.1 — Deduction and validity",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "deductive-vs-inductive", prompt: "Reasoning that aims to guarantee its conclusion (if the premises are true, the conclusion must be true) is called ____.", correctAnswer: "deductive", explanation: "Deductive arguments aim for necessity." },
      { topicSlug: "deductive-vs-inductive", prompt: "'Every swan I have seen is white, so all swans are white.' Is this deductive or inductive?", correctAnswer: "inductive", explanation: "It generalizes from observations to a probable conclusion." },
      { topicSlug: "validity-and-soundness", prompt: "An argument that is valid AND has all true premises is called ____.", correctAnswer: "sound", explanation: "Soundness = validity + all true premises." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Logical forms",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "validity-and-soundness", prompt: "Can a valid argument have a false conclusion? Answer yes or no.", correctAnswer: "yes", explanation: "Yes — if one of its premises is false. Only sound arguments guarantee a true conclusion." },
      { topicSlug: "categorical-logic-syllogism", prompt: "'All A are B. All B are C. Therefore all A are C.' Is this valid or invalid?", correctAnswer: "valid", explanation: "This is a valid categorical syllogism (Barbara)." },
      { topicSlug: "propositional-logic-truth-tables", prompt: "'If P then Q' is false only when P is ____ and Q is false. One word.", correctAnswer: "true", explanation: "A conditional fails only when the antecedent is true and the consequent false." },
      { topicSlug: "propositional-logic-truth-tables", prompt: "From 'If P then Q' and 'not Q', what can you validly conclude? (This valid form is modus tollens.)", correctAnswer: "not P", explanation: "Modus tollens: P→Q, ¬Q, therefore ¬P." },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Weeks 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions: "Cumulative midterm. 60 minutes. Pasting disabled.",
    problems: [
      { topicSlug: "arguments-vs-nonarguments", prompt: "'The room was cold and dark.' Is this an argument or a non-argument?", correctAnswer: "non-argument", explanation: "It is a description; nothing is being supported." },
      { topicSlug: "premises-and-conclusions", prompt: "Name one common premise-indicator word.", correctAnswer: "because", explanation: "Because, since, for, and given that all indicate premises." },
      { topicSlug: "deductive-vs-inductive", prompt: "An argument whose premises are meant to make the conclusion probable but not certain is ____.", correctAnswer: "inductive", explanation: "Inductive support is a matter of degree." },
      { topicSlug: "validity-and-soundness", prompt: "Affirming the consequent (P→Q, Q, therefore P) is valid or invalid?", correctAnswer: "invalid", explanation: "It is a formal fallacy; Q can hold for other reasons." },
      { topicSlug: "categorical-logic-syllogism", prompt: "'All cats are animals. All dogs are animals. Therefore all dogs are cats.' Valid or invalid?", correctAnswer: "invalid", explanation: "True premises, false conclusion — the form is broken." },
      { topicSlug: "propositional-logic-truth-tables", prompt: "From 'If P then Q' and 'P', what follows? (modus ponens)", correctAnswer: "Q", explanation: "Modus ponens: P→Q, P, therefore Q." },
      { topicSlug: "inductive-strength-generalization", prompt: "Drawing a sweeping conclusion from too small a sample is the ____ generalization.", correctAnswer: "hasty", explanation: "Hasty generalization relies on an inadequate sample." },
      { topicSlug: "analogical-reasoning", prompt: "An argument from analogy is stronger when the two things share more ____ similarities.", correctAnswer: "relevant", explanation: "Relevant similarities (not surface ones) strengthen an analogy." },
    ],
  },

  // Week 3
  {
    kind: "homework",
    title: "Homework 3.1 — Fallacies",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "fallacies-of-relevance", prompt: "Attacking the person instead of their argument is the ____ fallacy. (Latin term.)", correctAnswer: "ad hominem", explanation: "Ad hominem targets the arguer rather than the argument." },
      { topicSlug: "fallacies-weak-induction", prompt: "Concluding A caused B just because A came before B is the ____ fallacy. (Latin, two words.)", correctAnswer: "post hoc", explanation: "Post hoc ergo propter hoc confuses sequence with causation." },
      { topicSlug: "fallacies-presumption-ambiguity", prompt: "A question that presupposes something unproven, like 'Have you stopped lying?', is a ____ question.", correctAnswer: "loaded", explanation: "Also called a complex question; it smuggles in an assumption." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Bias, language, and sources",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "rhetoric-persuasion-spin", prompt: "Word choices that carry judgment, like 'freedom fighter' vs. 'terrorist', are called ____ language.", correctAnswer: "loaded", explanation: "Loaded (emotive) language steers feeling rather than supplying evidence." },
      { topicSlug: "cognitive-biases-motivated-reasoning", prompt: "Seeking out only evidence that supports what you already believe is ____ bias.", correctAnswer: "confirmation", explanation: "Confirmation bias favors belief-consistent evidence." },
      { topicSlug: "language-definition-vagueness", prompt: "A term with multiple distinct meanings (like 'bank') is ____.", correctAnswer: "ambiguous", explanation: "Ambiguity = multiple meanings; vagueness = fuzzy borders." },
      { topicSlug: "credibility-sources-testimony", prompt: "Trusting a claim because a celebrity (not an expert) endorsed it is an appeal to inappropriate ____.", correctAnswer: "authority", explanation: "Appeal to inappropriate authority cites an unqualified source." },
    ],
  },
  {
    kind: "test",
    title: "Week 3 Test",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 40,
    instructions: "Timed. 40 minutes. Pasting disabled.",
    problems: [
      { topicSlug: "fallacies-of-relevance", prompt: "Distorting someone's view into a weaker version to attack it is the ____ ____ fallacy. Two words.", correctAnswer: "straw man", explanation: "The straw man refutes a misrepresentation, not the real view." },
      { topicSlug: "fallacies-weak-induction", prompt: "Arguing that one small step will inevitably lead to disaster, with no support for the links, is the ____ ____ fallacy. Two words.", correctAnswer: "slippery slope", explanation: "The slippery slope assumes an unsupported chain of consequences." },
      { topicSlug: "fallacies-presumption-ambiguity", prompt: "Assuming the very thing you are trying to prove is ____ reasoning (also called begging the question).", correctAnswer: "circular", explanation: "Circular reasoning hides the conclusion among the premises." },
      { topicSlug: "cognitive-biases-motivated-reasoning", prompt: "Relying too heavily on the first piece of information you receive is ____ bias.", correctAnswer: "anchoring", explanation: "Anchoring lets an initial value skew later judgments." },
      { topicSlug: "credibility-sources-testimony", prompt: "Checking a claim by leaving the page to consult other independent sources is called ____ reading.", correctAnswer: "lateral", explanation: "Lateral reading is how professional fact-checkers verify sources." },
    ],
  },

  // Week 4
  {
    kind: "homework",
    title: "Homework 4.1 — Probability, evidence, decisions",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "probability-statistical-reasoning", prompt: "Ignoring how common a condition is when judging a positive test result is the base rate ____.", correctAnswer: "fallacy", explanation: "The base rate fallacy (neglect) ignores prior prevalence." },
      { topicSlug: "evaluating-evidence-science", prompt: "A claim that cannot in principle be shown false is said to be ____.", correctAnswer: "unfalsifiable", explanation: "Unfalsifiable claims make no testable prediction." },
      { topicSlug: "decision-making-uncertainty", prompt: "An outcome's value weighted by its probability is called its ____ value.", correctAnswer: "expected", explanation: "Expected value weights each outcome by its probability." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Values, writing, and misinformation",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "moral-value-reasoning", prompt: "A claim about what OUGHT to be the case (rather than what is) is a ____ claim.", correctAnswer: "normative", explanation: "Normative (value) claims concern what ought to be; they cannot be derived from facts alone." },
      { topicSlug: "reasoning-in-writing", prompt: "The single main claim an argumentative essay defends is called its ____.", correctAnswer: "thesis", explanation: "The thesis is the conclusion the whole essay supports." },
      { topicSlug: "detecting-misinformation", prompt: "Misinformation spread deliberately to deceive is specifically called ____.", correctAnswer: "disinformation", explanation: "Disinformation is intentional; misinformation may be unintentional." },
      { topicSlug: "critical-thinking-across-domains", prompt: "Using a reasoning skill learned in one area in a brand-new area is called ____.", correctAnswer: "transfer", explanation: "Transfer is using a skill in a new context; it must be built deliberately." },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — All weeks",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 90,
    instructions: "Cumulative final. 90 minutes. Pasting disabled.",
    problems: [
      { topicSlug: "arguments-vs-nonarguments", prompt: "'We should leave now, because the storm is coming.' Argument or non-argument?", correctAnswer: "argument", explanation: "A reason supports a conclusion, so it is an argument." },
      { topicSlug: "premises-and-conclusions", prompt: "In 'Since taxes rose, prices increased,' which word is the premise indicator?", correctAnswer: "since", explanation: "'Since' flags the premise 'taxes rose'." },
      { topicSlug: "validity-and-soundness", prompt: "An argument that is valid and has all true premises is ____.", correctAnswer: "sound", explanation: "Validity plus true premises equals soundness." },
      { topicSlug: "deductive-vs-inductive", prompt: "Reasoning from a representative sample to a claim about the whole population is deductive or inductive?", correctAnswer: "inductive", explanation: "Generalization from a sample is inductive." },
      { topicSlug: "propositional-logic-truth-tables", prompt: "Denying the antecedent (P→Q, not P, therefore not Q) is valid or invalid?", correctAnswer: "invalid", explanation: "It is a formal fallacy; Q may still hold for other reasons." },
      { topicSlug: "fallacies-of-relevance", prompt: "Dismissing a study because of who funded it, rather than its evidence, is which fallacy? (Latin.)", correctAnswer: "ad hominem", explanation: "Attacking the source instead of the argument is ad hominem (circumstantial)." },
      { topicSlug: "fallacies-weak-induction", prompt: "'I took the supplement and my cold went away, so it cured me.' Which fallacy? (Latin, two words.)", correctAnswer: "post hoc", explanation: "Post hoc mistakes sequence for causation." },
      { topicSlug: "cognitive-biases-motivated-reasoning", prompt: "Favoring evidence that confirms what you already believe is ____ bias.", correctAnswer: "confirmation", explanation: "Confirmation bias is the tendency to seek belief-consistent evidence." },
      { topicSlug: "probability-statistical-reasoning", prompt: "An outcome's value times its probability gives its ____ value.", correctAnswer: "expected", explanation: "Expected value combines magnitude and probability." },
      { topicSlug: "capstone-synthesis", prompt: "A claim is worth believing when its premises are true AND its reasoning is valid or ____.", correctAnswer: "strong", explanation: "Deductive reasoning must be valid; inductive reasoning must be strong." },
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as n from topics`);
  const row = (existing.rows[0] ?? {}) as { n?: number };
  if ((row.n ?? 0) > 0) {
    logger.info("Seed: already populated, skipping");
    return;
  }
  logger.info("Seed: populating course content");

  // Topics + lectures
  const slugToTopicId = new Map<string, number>();
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i]!;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
    slugToTopicId.set(t.slug, inserted.id);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
  }

  // Assignments + problems
  for (let i = 0; i < ASSIGNMENTS.length; i++) {
    const a = ASSIGNMENTS[i]!;
    const [inserted] = await db
      .insert(assignmentsTable)
      .values({
        kind: a.kind,
        title: a.title,
        weekNumber: a.weekNumber,
        position: i,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        instructions: a.instructions,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
    for (let p = 0; p < a.problems.length; p++) {
      const prob = a.problems[p]!;
      const topicId = slugToTopicId.get(prob.topicSlug);
      if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
      await db.insert(problemsTable).values({
        assignmentId: inserted.id,
        topicId,
        position: p,
        prompt: prob.prompt,
        correctAnswer: prob.correctAnswer,
        explanation: prob.explanation,
        hint: prob.hint ?? null,
      });
    }
  }

  logger.info({ topics: TOPICS.length, assignments: ASSIGNMENTS.length }, "Seed complete");
}
