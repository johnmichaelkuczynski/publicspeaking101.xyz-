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
  // Week 1 — Foundations
  {
    slug: "number-sense",
    title: "Number sense",
    weekNumber: 1,
    blurb: "Whole numbers, integers, rationals, irrationals; magnitude.",
    lectureTitle: "1.1 Number sense and the real line",
    body: `# Number sense

Quantitative reasoning starts with a clear sense of *what numbers mean*. Before any formula, we ask: what kind of number is this, how big is it, and is it plausible?

## The number line

Every real number sits somewhere on a single number line. **Natural numbers** ($1, 2, 3, \\dots$) count things. **Integers** ($\\dots, -2, -1, 0, 1, 2, \\dots$) add zero and negatives. **Rationals** ($\\mathbb{Q}$) are ratios of integers — $\\tfrac{3}{4}$, $-\\tfrac{7}{2}$, $0.25$. **Irrationals** like $\\sqrt{2}$, $\\pi$, and $e$ fill the gaps.

## Magnitude estimation

A college graduate should be able to answer "is the U.S. federal budget closer to \\$5 million, \\$5 billion, or \\$5 trillion?" without a calculator. We do this with **orders of magnitude** — powers of ten. Roughly:

- $10^3$ = thousand
- $10^6$ = million
- $10^9$ = billion
- $10^{12}$ = trillion

## Why it matters

A sense of plausible magnitude is the single best defense against arithmetic mistakes. If a calculator says a person's annual salary is \\$3.2 billion, you should immediately suspect a unit error.`,
  },
  {
    slug: "fractions-decimals-percents",
    title: "Fractions, decimals, and percents",
    weekNumber: 1,
    blurb: "Three notations for the same numbers; converting fluently.",
    lectureTitle: "1.2 Fractions, decimals, and percents",
    body: `# Fractions, decimals, and percents

These are three notations for the **same** numbers. Fluency means converting effortlessly.

## Conversions

- Fraction $\\to$ decimal: divide. $\\tfrac{3}{8} = 0.375$.
- Decimal $\\to$ percent: multiply by 100. $0.375 = 37.5\\%$.
- Percent $\\to$ fraction: write over 100 and simplify. $24\\% = \\tfrac{24}{100} = \\tfrac{6}{25}$.

## Percent change

$$\\text{percent change} = \\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100\\%$$

A price moving from \\$80 to \\$92 is a $\\tfrac{12}{80} = 15\\%$ increase.

## The compounding trap

A 20% loss followed by a 20% gain does *not* return you to even. $\\$100 \\to \\$80 \\to \\$96$. Percent changes compound multiplicatively, not additively.`,
  },
  {
    slug: "ratios-proportions",
    title: "Ratios and proportions",
    weekNumber: 1,
    blurb: "Comparing quantities; scaling; the cross-multiplication test.",
    lectureTitle: "1.3 Ratios and proportions",
    body: `# Ratios and proportions

A **ratio** compares two quantities of the same kind: 3 cups flour to 2 cups water is $3{:}2$. A **proportion** says two ratios are equal: $\\tfrac{a}{b} = \\tfrac{c}{d}$.

## Cross-multiplication

If $\\tfrac{a}{b} = \\tfrac{c}{d}$ and $b, d \\neq 0$, then $ad = bc$. This lets us solve for an unknown: $\\tfrac{x}{15} = \\tfrac{4}{6}$ gives $6x = 60$, so $x = 10$.

## Scaling recipes and maps

A 1:50,000 map means 1 cm on the map represents 50,000 cm = 500 m in reality. To scale a recipe from 4 to 10 servings, multiply every quantity by $\\tfrac{10}{4} = 2.5$.`,
  },
  {
    slug: "unit-conversions",
    title: "Unit conversions",
    weekNumber: 1,
    blurb: "Dimensional analysis; chaining conversion factors.",
    lectureTitle: "1.4 Units and dimensional analysis",
    body: `# Units and dimensional analysis

**Treat units as algebraic objects.** Multiply by conversion factors written as fractions equal to 1.

## A worked example

How many seconds in a (non-leap) year?

$$365 \\text{ days} \\times \\frac{24 \\text{ hours}}{1 \\text{ day}} \\times \\frac{60 \\text{ minutes}}{1 \\text{ hour}} \\times \\frac{60 \\text{ seconds}}{1 \\text{ minute}} = 31{,}536{,}000 \\text{ seconds}$$

Notice how *days, hours, minutes* cancel out and only *seconds* remains. If the units of your answer aren't right, the number isn't either.`,
  },
  {
    slug: "order-of-operations",
    title: "Order of operations",
    weekNumber: 1,
    blurb: "PEMDAS, the role of parentheses, and ambiguous notation.",
    lectureTitle: "1.5 Order of operations",
    body: `# Order of operations

The convention: **P**arentheses, **E**xponents, **M**ultiplication and **D**ivision (left to right), **A**ddition and **S**ubtraction (left to right).

## Worked example

$$3 + 4 \\times 2^2 - (6 - 2) = 3 + 4 \\times 4 - 4 = 3 + 16 - 4 = 15$$

## A pragmatic note

Real mathematicians use parentheses liberally to avoid all ambiguity. If you find yourself relying on PEMDAS to disambiguate $6 \\div 2(1+2)$, rewrite it.`,
  },
  {
    slug: "algebraic-expressions",
    title: "Algebraic expressions",
    weekNumber: 1,
    blurb: "Variables, terms, simplifying, evaluating.",
    lectureTitle: "1.6 Algebraic expressions",
    body: `# Algebraic expressions

A **variable** is a placeholder for an unknown. An **expression** combines variables, numbers, and operations: $3x + 2y - 5$.

## Combining like terms

Only terms with the same variable parts can be combined: $3x + 2x = 5x$, but $3x + 2y$ does not simplify further.

## Evaluating

To evaluate $2x^2 - 3x + 1$ at $x = 4$: $2(16) - 3(4) + 1 = 32 - 12 + 1 = 21$.`,
  },
  {
    slug: "linear-equations",
    title: "Linear equations",
    weekNumber: 1,
    blurb: "Solving for an unknown in one variable.",
    lectureTitle: "1.7 Linear equations",
    body: `# Linear equations in one variable

A **linear equation** has the form $ax + b = c$. We isolate $x$ by performing the same operation on both sides.

## Worked example

Solve $5x - 7 = 18$. Add 7 to both sides: $5x = 25$. Divide by 5: $x = 5$.

## With variables on both sides

$3(x + 4) = 2x - 1$. Distribute: $3x + 12 = 2x - 1$. Subtract $2x$: $x + 12 = -1$. Subtract 12: $x = -13$.`,
  },

  // Week 2 — Functions and models
  {
    slug: "linear-functions",
    title: "Linear functions",
    weekNumber: 2,
    blurb: "Slope, intercept, modeling constant rates of change.",
    lectureTitle: "2.1 Linear functions",
    body: `# Linear functions

A **linear function** has the form $f(x) = mx + b$ where $m$ is the slope and $b$ is the $y$-intercept.

## Slope as a rate of change

If $y$ is meters traveled and $x$ is seconds, the slope is meters per second — a velocity. Slope is "rise over run":

$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$

## Modeling

A taxi charges \\$3 to start the meter plus \\$2 per mile. The cost is $C(x) = 2x + 3$ — slope 2 dollars/mile, intercept 3 dollars.`,
  },
  {
    slug: "systems-of-equations",
    title: "Systems of equations",
    weekNumber: 2,
    blurb: "Two unknowns, two equations; substitution and elimination.",
    lectureTitle: "2.2 Systems of equations",
    body: `# Systems of equations

When two relationships hold simultaneously, we have a **system**. Geometrically: where do two lines cross?

## Substitution

$y = 2x + 1$ and $3x + y = 16$. Substitute: $3x + (2x + 1) = 16$, so $5x = 15$, $x = 3$, $y = 7$.

## Elimination

Add or subtract equations to eliminate one variable. The right tool depends on the form of the system.`,
  },
  {
    slug: "quadratics",
    title: "Quadratics",
    weekNumber: 2,
    blurb: "Parabolas, the quadratic formula, factoring.",
    lectureTitle: "2.3 Quadratic functions",
    body: `# Quadratic functions

$f(x) = ax^2 + bx + c$, with $a \\neq 0$. The graph is a **parabola**.

## The quadratic formula

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

The **discriminant** $b^2 - 4ac$ tells you how many real solutions exist: positive $\\to$ two, zero $\\to$ one, negative $\\to$ none.`,
  },
  {
    slug: "exponentials-logs",
    title: "Exponentials and logarithms",
    weekNumber: 2,
    blurb: "Multiplicative growth, decay, and inverse functions.",
    lectureTitle: "2.4 Exponentials and logs",
    body: `# Exponentials and logarithms

**Exponential** functions $f(x) = a \\cdot b^x$ model multiplicative growth (or decay if $0 < b < 1$).

## Logarithms

A **logarithm** asks "what power?". $\\log_{10}(1000) = 3$ because $10^3 = 1000$. Logs convert multiplication to addition: $\\log(ab) = \\log a + \\log b$.

## Why both?

Together they let us solve $2^x = 10$: take $\\log_2$ of both sides to get $x = \\log_2 10 \\approx 3.32$.`,
  },
  {
    slug: "function-modeling",
    title: "Function modeling",
    weekNumber: 2,
    blurb: "Choosing the right family of function for real data.",
    lectureTitle: "2.5 Function modeling",
    body: `# Choosing a model

Given a phenomenon, the first question is: **what family of function fits?**

- Constant rate of change $\\to$ linear.
- Constant percent change per unit time $\\to$ exponential.
- Rises and falls, single peak $\\to$ quadratic.
- Periodic behavior $\\to$ trigonometric.

Pick poorly and no amount of fitting will save you.`,
  },
  {
    slug: "inequalities",
    title: "Inequalities",
    weekNumber: 2,
    blurb: "Solving and interpreting strict and non-strict inequalities.",
    lectureTitle: "2.6 Inequalities",
    body: `# Inequalities

An inequality like $3x - 2 < 7$ is solved much like an equation, with one twist: **multiplying or dividing both sides by a negative number reverses the inequality.**

## Worked example

$-2x + 4 \\ge 10$. Subtract 4: $-2x \\ge 6$. Divide by $-2$ and flip: $x \\le -3$.`,
  },

  // Week 3 — Stats & probability
  {
    slug: "descriptive-statistics",
    title: "Descriptive statistics",
    weekNumber: 3,
    blurb: "Mean, median, mode, range, variance, standard deviation.",
    lectureTitle: "3.1 Descriptive statistics",
    body: `# Descriptive statistics

We summarize a dataset with **center** and **spread**.

## Center

- **Mean** $\\bar x = \\tfrac{1}{n}\\sum x_i$.
- **Median**: the middle value (or average of two middles).
- **Mode**: the most common value.

## Spread

- **Range** = max - min.
- **Variance** $\\sigma^2 = \\tfrac{1}{n}\\sum (x_i - \\bar x)^2$.
- **Standard deviation** $\\sigma = \\sqrt{\\sigma^2}$ — same units as the data.

The median resists outliers; the mean does not.`,
  },
  {
    slug: "data-visualization",
    title: "Data visualization",
    weekNumber: 3,
    blurb: "Histograms, box plots, scatter plots — and when each lies.",
    lectureTitle: "3.2 Data visualization",
    body: `# Visualization

The right chart reveals; the wrong chart deceives.

- **Histogram**: distribution of a single variable.
- **Box plot**: five-number summary, quick outlier spotting.
- **Scatter plot**: relationship between two variables.
- **Bar chart**: comparing categories — not for trends over time, that's a line chart.

Beware truncated y-axes, dual axes, and 3D pies. Most "interesting" data visualizations are interesting because of distortion.`,
  },
  {
    slug: "probability-basics",
    title: "Probability basics",
    weekNumber: 3,
    blurb: "Sample spaces, events, and the basic rules.",
    lectureTitle: "3.3 Probability basics",
    body: `# Probability basics

A **probability** is a number in $[0, 1]$ measuring how likely an event is.

## Rules

- $P(\\text{not } A) = 1 - P(A)$.
- For mutually exclusive $A$ and $B$: $P(A \\cup B) = P(A) + P(B)$.
- For independent $A$ and $B$: $P(A \\cap B) = P(A) \\cdot P(B)$.

A fair die has $P(\\text{roll } 6) = \\tfrac{1}{6}$. Rolling two dice and getting *two* sixes? $\\tfrac{1}{6} \\cdot \\tfrac{1}{6} = \\tfrac{1}{36}$.`,
  },
  {
    slug: "conditional-probability",
    title: "Conditional probability",
    weekNumber: 3,
    blurb: "P(A|B), independence, and Bayes' theorem.",
    lectureTitle: "3.4 Conditional probability and Bayes",
    body: `# Conditional probability

$P(A \\mid B)$ — the probability of $A$ given that $B$ happened — equals $\\tfrac{P(A \\cap B)}{P(B)}$.

## Bayes' theorem

$$P(A \\mid B) = \\frac{P(B \\mid A) \\cdot P(A)}{P(B)}$$

This is the engine of medical testing, spam filtering, and most modern AI. The classic warning: a test that's "99% accurate" for a 1-in-10,000 disease has a *terrible* positive predictive value.`,
  },
  {
    slug: "distributions",
    title: "Distributions",
    weekNumber: 3,
    blurb: "Normal, binomial, and the central limit theorem.",
    lectureTitle: "3.5 Distributions",
    body: `# Distributions

A **distribution** describes how a random quantity is spread over its possible values.

## The normal distribution

The bell curve. Parametrized by mean $\\mu$ and standard deviation $\\sigma$. Roughly 68% of mass within $\\pm \\sigma$, 95% within $\\pm 2\\sigma$, 99.7% within $\\pm 3\\sigma$.

## Why it's everywhere

The **central limit theorem**: averages of many independent samples are approximately normal, regardless of the underlying distribution. This is why so much of statistics works.`,
  },
  {
    slug: "sampling-confidence",
    title: "Sampling and confidence intervals",
    weekNumber: 3,
    blurb: "Estimating populations from samples; margin of error.",
    lectureTitle: "3.6 Sampling and confidence intervals",
    body: `# Sampling

We rarely measure a whole population. We **sample** and infer.

## Margin of error

For a proportion estimated from a random sample of size $n$, a 95% confidence interval has roughly margin of error $\\tfrac{1}{\\sqrt{n}}$. A poll of 1000 has margin around $\\pm 3.2\\%$.

## What it means

A 95% confidence interval means: if we repeated this sampling procedure many times, about 95% of the intervals we computed would contain the true value. It does *not* mean "95% chance the truth is in this interval."`,
  },
  {
    slug: "correlation-regression",
    title: "Correlation and regression",
    weekNumber: 3,
    blurb: "Lines of best fit; correlation vs causation.",
    lectureTitle: "3.7 Correlation and regression",
    body: `# Correlation and regression

The **correlation coefficient** $r$ measures linear association, $-1 \\le r \\le 1$.

**Linear regression** fits a line $y = mx + b$ minimizing the squared residuals.

## The cardinal warning

*Correlation does not imply causation.* Ice-cream sales and drownings are correlated, but neither causes the other — both are driven by summer weather. Any regression result must be interpreted with a model of *what could plausibly cause what*.`,
  },

  // Week 4 — Reasoning & capstone
  {
    slug: "set-theory",
    title: "Set theory",
    weekNumber: 4,
    blurb: "Sets, unions, intersections, complements, Venn diagrams.",
    lectureTitle: "4.1 Set theory",
    body: `# Set theory

A **set** is a collection of distinct elements: $A = \\{1, 2, 3\\}$.

## Operations

- **Union** $A \\cup B$: in either.
- **Intersection** $A \\cap B$: in both.
- **Complement** $A^c$: not in $A$.
- **Difference** $A \\setminus B$: in $A$ but not $B$.

## Inclusion-exclusion

$|A \\cup B| = |A| + |B| - |A \\cap B|$ — the count of each thing, minus double-counting.`,
  },
  {
    slug: "propositional-logic",
    title: "Propositional logic",
    weekNumber: 4,
    blurb: "AND, OR, NOT, IF; truth tables; common fallacies.",
    lectureTitle: "4.2 Propositional logic",
    body: `# Propositional logic

A **proposition** is a statement that is either true or false. Connectives: $\\neg$ (not), $\\wedge$ (and), $\\vee$ (or), $\\to$ (if-then), $\\leftrightarrow$ (iff).

## Truth tables

$P \\to Q$ is false only when $P$ is true and $Q$ is false. ("If you mow the lawn, I'll pay you \\$20" is only broken if you mow and I don't pay.)

## Fallacies

- **Affirming the consequent**: from $P \\to Q$ and $Q$, you cannot conclude $P$.
- **Denying the antecedent**: from $P \\to Q$ and $\\neg P$, you cannot conclude $\\neg Q$.`,
  },
  {
    slug: "combinatorics",
    title: "Combinatorics",
    weekNumber: 4,
    blurb: "Counting arrangements; permutations and combinations.",
    lectureTitle: "4.3 Combinatorics",
    body: `# Combinatorics

How many ways can things happen?

## Permutations and combinations

- Permutations (order matters): $P(n, k) = \\tfrac{n!}{(n-k)!}$.
- Combinations (order doesn't): $C(n, k) = \\binom{n}{k} = \\tfrac{n!}{k!(n-k)!}$.

How many 5-card poker hands? $\\binom{52}{5} = 2{,}598{,}960$.`,
  },
  {
    slug: "geometry-trig",
    title: "Geometry and trigonometry",
    weekNumber: 4,
    blurb: "Areas, volumes, right-triangle trig.",
    lectureTitle: "4.4 Geometry and trigonometry",
    body: `# Geometry and trigonometry

## Areas and volumes

- Rectangle: $A = lw$.
- Triangle: $A = \\tfrac{1}{2}bh$.
- Circle: $A = \\pi r^2$, $C = 2\\pi r$.
- Box: $V = lwh$.
- Sphere: $V = \\tfrac{4}{3}\\pi r^3$.

## Right-triangle trig

For a right triangle with angle $\\theta$:

$$\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}, \\quad \\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}}, \\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$$

And the Pythagorean theorem: $a^2 + b^2 = c^2$.`,
  },
  {
    slug: "rates-of-change",
    title: "Rates of change",
    weekNumber: 4,
    blurb: "Average and instantaneous rates; a gentle intro to derivatives.",
    lectureTitle: "4.5 Rates of change",
    body: `# Rates of change

The **average rate of change** of $f$ over $[a, b]$ is $\\tfrac{f(b) - f(a)}{b - a}$ — the slope of the secant line.

## Instantaneous rate

Let $b$ approach $a$. The limit, when it exists, is the **derivative** $f'(a)$ — the slope of the tangent line at $a$.

You don't need to compute derivatives in this course, but you should be able to interpret one. A derivative is "how fast is this changing, right now, per unit input."`,
  },
  {
    slug: "financial-math",
    title: "Financial math",
    weekNumber: 4,
    blurb: "Compound interest, APR vs APY, present and future value.",
    lectureTitle: "4.6 Financial mathematics",
    body: `# Financial mathematics

## Compound interest

Principal $P$ at annual rate $r$ compounded $n$ times per year for $t$ years grows to:

$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$

## APR vs APY

**APR** (annual percentage rate) is the stated nominal rate. **APY** (annual percentage yield) accounts for compounding. \\$1000 at 6% APR compounded monthly has APY $= (1 + 0.06/12)^{12} - 1 \\approx 6.17\\%$.

## The Rule of 72

Money compounding at rate $r\\%$ per year roughly doubles in $72/r$ years.`,
  },
  {
    slug: "quantitative-arguments",
    title: "Quantitative arguments",
    weekNumber: 4,
    blurb: "Reading, writing, and evaluating numerical claims in prose.",
    lectureTitle: "4.7 Quantitative arguments",
    body: `# Quantitative arguments

The capstone skill: take a quantitative claim from the wild and evaluate it.

## A checklist

1. **What is the population?** "Most Americans" — how many is that?
2. **What is the source?** Self-report, observation, experiment?
3. **What are the units?** Per capita? Per dollar? Per year?
4. **Compared to what?** A number without a comparison is rarely meaningful.
5. **Is the magnitude plausible?** Run a back-of-envelope check.

## Writing your own

Use precise numbers with explicit units. State your assumptions. Distinguish what you measured from what you inferred. Cite.`,
  },
  {
    slug: "capstone-synthesis",
    title: "Capstone synthesis",
    weekNumber: 4,
    blurb: "Putting it all together on a real-world problem.",
    lectureTitle: "4.8 Capstone synthesis",
    body: `# Capstone synthesis

The final week ties together everything from the course. A capstone problem might ask:

> A city of 200,000 is considering a \\$40M investment in a new bus line. The current ridership is 12,000 trips/day at \\$2/trip. The new line is projected to increase ridership by 35% and reduce car commutes by an estimated 4%. Evaluate.

Solving this requires *units* (trips, dollars, years), *percentages*, *modeling* (linear vs nonlinear effects), *probability* (uncertainty in the projections), and *quantitative argument* (what would change your mind?). That is quantitative reasoning.`,
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
    title: "Homework 1.1 — Number, fractions, ratios",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice. Show your work in the answer box.",
    problems: [
      { topicSlug: "number-sense", prompt: "Is 5 billion closer to $5 \\times 10^6$ or $5 \\times 10^9$? Write the order of magnitude.", correctAnswer: "10^9", explanation: "Billion is $10^9$." },
      { topicSlug: "fractions-decimals-percents", prompt: "A jacket costs $\\$80$. It is discounted by 25%. What is the sale price in dollars?", correctAnswer: "60", explanation: "$80 \\times 0.75 = 60$." },
      { topicSlug: "ratios-proportions", prompt: "If 3 cups of flour make 12 cookies, how many cups make 40 cookies?", correctAnswer: "10", explanation: "$\\tfrac{3}{12} = \\tfrac{x}{40}$, so $x = 10$." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Units, expressions, equations",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "unit-conversions", prompt: "How many minutes in 3 days?", correctAnswer: "4320", explanation: "$3 \\times 24 \\times 60 = 4320$." },
      { topicSlug: "order-of-operations", prompt: "Evaluate: $2 + 3 \\times 4^2 - 5$.", correctAnswer: "45", explanation: "$2 + 3 \\times 16 - 5 = 2 + 48 - 5 = 45$." },
      { topicSlug: "algebraic-expressions", prompt: "Evaluate $3x^2 - 2x + 1$ at $x = -2$.", correctAnswer: "17", explanation: "$3(4) - 2(-2) + 1 = 12 + 4 + 1 = 17$." },
      { topicSlug: "linear-equations", prompt: "Solve for $x$: $4x - 9 = 23$.", correctAnswer: "8", explanation: "$4x = 32 \\Rightarrow x = 8$." },
    ],
  },
  {
    kind: "test",
    title: "Week 1 Test",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions: "Timed. 30 minutes. Math keyboard available; pasting is disabled.",
    problems: [
      { topicSlug: "fractions-decimals-percents", prompt: "Convert $\\tfrac{7}{8}$ to a percent.", correctAnswer: "87.5%", explanation: "$7 \\div 8 = 0.875 = 87.5\\%$." },
      { topicSlug: "ratios-proportions", prompt: "A map uses scale 1:25000. A road is 6 cm long on the map. How many meters long is the road in reality?", correctAnswer: "1500", explanation: "$6 \\text{ cm} \\times 25000 = 150000 \\text{ cm} = 1500 \\text{ m}$." },
      { topicSlug: "linear-equations", prompt: "Solve: $3(x + 4) = 2x + 21$.", correctAnswer: "9", explanation: "$3x + 12 = 2x + 21 \\Rightarrow x = 9$." },
      { topicSlug: "unit-conversions", prompt: "Convert 90 km/h to m/s. Round to two decimals.", correctAnswer: "25", explanation: "$90 \\times \\tfrac{1000}{3600} = 25$ m/s." },
      { topicSlug: "number-sense", prompt: "Which is largest: $\\sqrt{2}$, $\\pi/2$, or $1.5$?", correctAnswer: "pi/2", explanation: "$\\sqrt{2} \\approx 1.414$, $\\pi/2 \\approx 1.571$, so $\\pi/2$ is largest." },
    ],
  },

  // Week 2
  {
    kind: "homework",
    title: "Homework 2.1 — Lines and systems",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "linear-functions", prompt: "Find the slope of the line through $(2, 5)$ and $(6, 13)$.", correctAnswer: "2", explanation: "$(13 - 5) / (6 - 2) = 8/4 = 2$." },
      { topicSlug: "linear-functions", prompt: "Write $y$ as a linear function of $x$ if it costs \\$5 plus \\$2 per item, where $x$ is items.", correctAnswer: "y = 2x + 5", explanation: "Slope 2, intercept 5." },
      { topicSlug: "systems-of-equations", prompt: "Solve the system: $x + y = 10$ and $x - y = 4$. Give $x$.", correctAnswer: "7", explanation: "Add: $2x = 14$, $x = 7$." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Quadratics, exponentials, inequalities",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "quadratics", prompt: "Solve: $x^2 - 5x + 6 = 0$. Give the larger root.", correctAnswer: "3", explanation: "$(x-2)(x-3) = 0$, roots 2 and 3." },
      { topicSlug: "exponentials-logs", prompt: "Solve for $x$: $2^x = 32$.", correctAnswer: "5", explanation: "$2^5 = 32$." },
      { topicSlug: "inequalities", prompt: "Solve: $-3x + 5 \\ge 11$. Give the boundary value of $x$.", correctAnswer: "-2", explanation: "$-3x \\ge 6 \\Rightarrow x \\le -2$. Boundary: $-2$." },
      { topicSlug: "function-modeling", prompt: "A population doubles every 4 years. After 12 years, by what factor has it grown?", correctAnswer: "8", explanation: "$2^{12/4} = 2^3 = 8$." },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Weeks 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions: "Cumulative midterm. 60 minutes. Math keyboard available; pasting disabled.",
    problems: [
      { topicSlug: "fractions-decimals-percents", prompt: "A stock loses 20% then gains 25%. Net percent change?", correctAnswer: "0%", explanation: "$1 \\times 0.8 \\times 1.25 = 1$ — no change." },
      { topicSlug: "ratios-proportions", prompt: "If 4 workers paint 5 fences in 3 days, how many fences will 6 workers paint in 3 days (same rate)?", correctAnswer: "7.5", explanation: "Workers scale linearly: $\\tfrac{6}{4} \\times 5 = 7.5$." },
      { topicSlug: "unit-conversions", prompt: "A car travels 60 mph. How many feet per second is that? (1 mile = 5280 ft.) Round to whole.", correctAnswer: "88", explanation: "$60 \\times 5280 / 3600 = 88$ ft/s." },
      { topicSlug: "linear-equations", prompt: "Solve: $\\tfrac{x}{3} + 4 = 10$.", correctAnswer: "18", explanation: "$\\tfrac{x}{3} = 6 \\Rightarrow x = 18$." },
      { topicSlug: "linear-functions", prompt: "Line through $(0, 4)$ with slope $-3$. What is $y$ at $x = 5$?", correctAnswer: "-11", explanation: "$y = -3x + 4 = -15 + 4 = -11$." },
      { topicSlug: "systems-of-equations", prompt: "Solve: $2x + y = 9$, $x - y = 0$. Give $y$.", correctAnswer: "3", explanation: "$x = y$, so $3x = 9$, $x = y = 3$." },
      { topicSlug: "quadratics", prompt: "How many real solutions does $x^2 + 2x + 5 = 0$ have?", correctAnswer: "0", explanation: "Discriminant $= 4 - 20 = -16 < 0$." },
      { topicSlug: "exponentials-logs", prompt: "Evaluate $\\log_{10}(10000)$.", correctAnswer: "4", explanation: "$10^4 = 10000$." },
    ],
  },

  // Week 3
  {
    kind: "homework",
    title: "Homework 3.1 — Stats and probability",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "descriptive-statistics", prompt: "Find the median of: 2, 4, 4, 6, 9, 12, 15.", correctAnswer: "6", explanation: "Middle value of 7 sorted numbers is the 4th: 6." },
      { topicSlug: "descriptive-statistics", prompt: "Find the mean of: 5, 7, 9, 11, 13.", correctAnswer: "9", explanation: "$(5+7+9+11+13)/5 = 45/5 = 9$." },
      { topicSlug: "probability-basics", prompt: "A fair coin is flipped 3 times. What is the probability of all heads?", correctAnswer: "1/8", explanation: "$(1/2)^3 = 1/8$." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Distributions and inference",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "conditional-probability", prompt: "P(A) = 0.4, P(B|A) = 0.5. What is P(A and B)?", correctAnswer: "0.2", explanation: "$P(A \\cap B) = P(A) \\cdot P(B|A) = 0.4 \\cdot 0.5 = 0.2$." },
      { topicSlug: "distributions", prompt: "In a normal distribution, approximately what percent of values fall within one standard deviation of the mean?", correctAnswer: "68%", explanation: "Empirical rule: 68-95-99.7." },
      { topicSlug: "sampling-confidence", prompt: "A poll of $n = 400$ has approximate margin of error $1/\\sqrt{n}$. What is the margin as a percent? Round to whole.", correctAnswer: "5%", explanation: "$1/\\sqrt{400} = 1/20 = 0.05$." },
      { topicSlug: "correlation-regression", prompt: "If $r = -0.9$ between $X$ and $Y$, the relationship is best described as: positive, negative, or none?", correctAnswer: "negative", explanation: "Sign of $r$ gives direction." },
    ],
  },
  {
    kind: "test",
    title: "Week 3 Test",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 40,
    instructions: "Timed. 40 minutes. Math keyboard available; pasting disabled.",
    problems: [
      { topicSlug: "descriptive-statistics", prompt: "Standard deviation of {2, 2, 2, 2}?", correctAnswer: "0", explanation: "No spread — all values equal." },
      { topicSlug: "data-visualization", prompt: "A box plot shows median, quartiles, and what else (one word)?", correctAnswer: "outliers", explanation: "Whiskers and outliers." },
      { topicSlug: "probability-basics", prompt: "Two fair dice are rolled. Probability the sum is 7?", correctAnswer: "1/6", explanation: "6 of 36 outcomes sum to 7." },
      { topicSlug: "conditional-probability", prompt: "A test is 99% accurate for a disease present in 1% of people. Given a positive test, probability of disease? (Use Bayes.) Round to two decimals.", correctAnswer: "0.5", explanation: "$\\tfrac{0.99 \\times 0.01}{0.99 \\times 0.01 + 0.01 \\times 0.99} = 0.5$." },
      { topicSlug: "sampling-confidence", prompt: "To halve the margin of error of a poll, by what factor must sample size grow?", correctAnswer: "4", explanation: "Margin scales as $1/\\sqrt{n}$." },
    ],
  },

  // Week 4
  {
    kind: "homework",
    title: "Homework 4.1 — Sets, logic, combinatorics",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "set-theory", prompt: "$A = \\{1,2,3,4\\}$, $B = \\{3,4,5,6\\}$. $|A \\cup B| = ?$", correctAnswer: "6", explanation: "Union is {1,2,3,4,5,6}, size 6." },
      { topicSlug: "propositional-logic", prompt: "If $P \\to Q$ is true and $Q$ is false, what must $P$ be?", correctAnswer: "false", explanation: "Contrapositive: $\\neg Q \\to \\neg P$." },
      { topicSlug: "combinatorics", prompt: "How many ways to choose 3 books from 10?", correctAnswer: "120", explanation: "$\\binom{10}{3} = 120$." },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Geometry, rates, finance",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Untimed practice.",
    problems: [
      { topicSlug: "geometry-trig", prompt: "Area of a circle with radius 5? Use $\\pi$.", correctAnswer: "25π", explanation: "$\\pi r^2 = 25\\pi$." },
      { topicSlug: "geometry-trig", prompt: "Right triangle with legs 3 and 4. Hypotenuse?", correctAnswer: "5", explanation: "$\\sqrt{9 + 16} = 5$." },
      { topicSlug: "rates-of-change", prompt: "$f(x) = x^2$. Average rate of change on $[1, 3]$?", correctAnswer: "4", explanation: "$(9 - 1)/(3 - 1) = 4$." },
      { topicSlug: "financial-math", prompt: "Using the Rule of 72: at 6% annual return, about how many years to double?", correctAnswer: "12", explanation: "$72/6 = 12$." },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — All weeks",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 90,
    instructions: "Cumulative final. 90 minutes. Math keyboard available; pasting disabled.",
    problems: [
      { topicSlug: "fractions-decimals-percents", prompt: "If a price rises 10% then falls 10%, what is the net percent change? Use a negative sign if decrease.", correctAnswer: "-1%", explanation: "$1.1 \\times 0.9 = 0.99 = -1\\%$." },
      { topicSlug: "linear-equations", prompt: "Solve: $5(x - 2) = 3x + 4$.", correctAnswer: "7", explanation: "$5x - 10 = 3x + 4 \\Rightarrow 2x = 14 \\Rightarrow x = 7$." },
      { topicSlug: "quadratics", prompt: "Solve: $x^2 = 49$. Give the positive root.", correctAnswer: "7", explanation: "$x = \\pm 7$." },
      { topicSlug: "exponentials-logs", prompt: "Solve: $\\log_2(x) = 5$.", correctAnswer: "32", explanation: "$x = 2^5 = 32$." },
      { topicSlug: "descriptive-statistics", prompt: "Mean of: 10, 20, 30, 40, 100?", correctAnswer: "40", explanation: "$200/5 = 40$." },
      { topicSlug: "conditional-probability", prompt: "$P(A) = 0.3$, $P(B) = 0.5$, $A$ and $B$ independent. $P(A \\cap B) = ?$", correctAnswer: "0.15", explanation: "$0.3 \\times 0.5 = 0.15$." },
      { topicSlug: "set-theory", prompt: "$|A| = 10$, $|B| = 15$, $|A \\cap B| = 4$. $|A \\cup B| = ?$", correctAnswer: "21", explanation: "$10 + 15 - 4 = 21$." },
      { topicSlug: "combinatorics", prompt: "How many 4-letter arrangements of A, B, C, D, E (no repeats)?", correctAnswer: "120", explanation: "$5 \\times 4 \\times 3 \\times 2 = 120$." },
      { topicSlug: "geometry-trig", prompt: "$\\sin(30°) = ?$ Give a fraction.", correctAnswer: "1/2", explanation: "Standard value." },
      { topicSlug: "financial-math", prompt: "\\$1000 at 5% APR compounded annually for 2 years. Value? (No dollar sign.)", correctAnswer: "1102.50", explanation: "$1000 \\times 1.05^2 = 1102.50$." },
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
