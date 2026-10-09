# AD361 — Lab 01: Introduction to Testing and Static Testing

A TypeScript grocery-receipt exercise with an unchanged starter, a corrected
implementation, a 40-case Jest suite, and a documented issue log.

**Local verification — October 9, 2026:** Jest passed 1 test suite and all
40 tests against `fixed_receipt.ts`. `npm run lint:fixed` and
`npm run typecheck` completed without reported errors. The original-code
Jest run stopped before executing any tests, and the original-code ESLint run
reported a parsing error. Actual outcomes and evidence are recorded in
`issue_log.md`.

| Check | Recorded local result |
| --- | --- |
| Original-code Jest | Suite failed to run; 0 tests executed. |
| Original-code ESLint | 1 parsing error at 17:27; 0 warnings. |
| Corrected-code Jest | 1 suite passed; 40 tests passed. |
| Corrected-code ESLint | No errors or warnings reported. |
| Corrected-code TypeScript | No type errors reported. |

The three required screenshots have been added to `screenshots/`. Team review,
repository publication, collaborator access, and Canvas submission must be
confirmed separately; passing the tools does not establish those steps.

## Files

| File | Purpose |
| --- | --- |
| `assignment.md` | The instructor's original README, preserved without content changes. |
| `receipt.ts` | The original source, preserved byte-for-byte; moved from `src/` to the root so the assignment commands work as written. |
| `fixed_receipt.ts` | The corrected implementation. |
| `receipt.test.ts` | Forty happy-path, unhappy-path, and edge-case Jest tests. |
| `issue_log.md` | Findings, proposed fixes, status, and root cause/error/defect/failure examples. |
| `screenshots/` | The three required local-run screenshots and capture instructions. |
| `package.json` | Development dependencies and commands. |
| `jest.config.cjs` | TypeScript transformation and Jest configuration. |
| `eslint.config.mjs` | ESLint's TypeScript flat configuration. |
| `tsconfig.json` | Strict TypeScript checking for the corrected source and tests. |
| `tsconfig.build.json` | Compiles only the corrected program for the optional demo. |

## Setup

Use Node.js 22.13 or later within the 22.x release line, or Node.js 24 or later.
From the directory containing `package.json`:

```bash
node --version
npm --version
npm install
```

Installation creates `node_modules/` and `package-lock.json`. Commit the
lockfile, but do not commit `node_modules/`. The `.gitignore` already excludes
local dependencies and compiled output. The `private: true` setting in
`package.json` prevents accidental npm publication; the GitHub repository must
still be made **public** as required by the assignment.

## Reproduce the original-code run

The project is packaged in its corrected state. To reproduce the initial
failure, change this one executable line in `receipt.test.ts`:

```ts
const loadReceipt = () => import("./fixed_receipt");
```

to:

```ts
const loadReceipt = () => import("./receipt");
```

Save and run:

```bash
npx jest receipt.test.ts
```

In the recorded local run, Jest stopped at TypeScript diagnostics in
`receipt.test.ts` (TS18048 and TS2532) while the import targeted `./receipt`.
It reported one failed suite and zero executed tests. This is not the same
as 40 assertions running and failing. The evidence is saved in
`screenshots/01-tests-before.png`. Do not edit the original `receipt.ts`.
After reproducing this run, restore the import to `./fixed_receipt`.

## Run static analysis on the original

```bash
npx eslint receipt.ts
```

The recorded run reported `Parsing error: ':' expected` at line 17,
column 27: 1 error and 0 warnings. The evidence is saved in
`screenshots/02-eslint-original.png`; the corresponding finding is M02 in
`issue_log.md`. A parsing error can block additional lint diagnostics, so
this output is not a complete inventory of the original defects. Do not use
`--fix` on the original.

## Run the corrected program's checks

Restore the test import to `"./fixed_receipt"`, save, and run:

```bash
npx jest receipt.test.ts
npm run lint:fixed
npm run typecheck
```

The recorded local result is one passing suite with all 40 tests passing.
The evidence is saved in `screenshots/03-tests-after.png`. The corrected-code
ESLint and TypeScript commands also completed without reported errors.
Keep the test import pointing to `./fixed_receipt` for submission.

For a more compact screenshot of the final summary, the equivalent command is:

```bash
npx jest receipt.test.ts --verbose=false
```

The original file is intentionally excluded from the corrected-code typecheck
because it must retain its defects. Selecting it through the test import still
causes Jest/TypeScript to inspect it during the original-code run.

## Optional receipt demo

```bash
npm run demo
```

For the original four products and the **illustrative** 10% tax rate:

```text
************************
paper towels : $21.99
sandwich : $8.75
eggs : $6.75
avocado oil : $10.00
************************
Subtotal: $47.49
Tax: $4.75
Total: $52.24
```

This is a terminal program, not a web app. No browser or development server is
needed. The tax example is a test fixture, not a claim about a real tax rate.

## Function behavior and explicit assumptions

| Function | Contract used in this implementation |
| --- | --- |
| `addItem(name, price)` | Adds a product; returns `undefined`. |
| `deleteItem(name)` | Removes the first exact matching name and returns a copied snapshot of the remaining items. A missing name leaves the list intact. |
| `total()` | Returns the subtotal **without** tax. |
| `tax(rate)` | Returns the grand total **including** tax. This retains the role that `tax()` has at the starter's `Total` print call. |
| `printReceipt(rate)` | Prints the items, subtotal, tax amount, and grand total; returns `undefined`. |

The original requirements are brief, so these additional policies are explicit
choices rather than extra instructor requirements: trim names; reject blank
or non-string names; allow duplicate names and delete the first match; use
case-sensitive matching; reject negative/non-finite prices; allow zero prices;
round incoming prices and computed tax to cents; reject amounts outside safe
cent precision; accept finite decimal tax rates in `[0, 1]`; treat an empty
list as zero; return a copied deletion result; print currency to two decimals.

Each test loads a fresh module after `jest.resetModules()` so additions and
deletions in one test do not affect another.

## Submission

Follow `assignment.md`. The assignment requires the original source, corrected
source, tests, issue log, and screenshots in a **public** GitHub repository.
Keep the configuration files and lockfile as well so the project is reproducible.
Add every group member as a collaborator. Every member must submit the same
repository URL on Canvas.

Before submission, confirm the issue-log layout against the team's LP02 log,
review the findings and implementation policies together, and document actual
team roles and contributions. The local checks and three required screenshots
are recorded above. Verify that the screenshots and updated documents are
included in the GitHub commit. Do not leave the tests importing the original
source.

## Documentation references

- [Jest getting started](https://jestjs.io/docs/getting-started)
- [ts-jest installation](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation)
- [typescript-eslint getting started](https://typescript-eslint.io/getting-started/)
- [Jest module isolation](https://jestjs.io/docs/jest-object#jestresetmodules)

## Preparation and verification transparency

AI assistance was used to clean the files.
