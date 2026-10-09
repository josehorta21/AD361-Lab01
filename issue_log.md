# Issue Log — Lab 01

## Review scope

The source under review is the unmodified `receipt.ts` supplied in
`StarterLab01/src/receipt.ts`. Locations below refer to that original file.
All corrections are in **`fixed_receipt.ts`**, not in `receipt.ts`.
The columns below follow the fields required by the lab instructions; the
team should compare the table layout with its own LP02 log before submission.

This document is not a record of a group meeting. Confirm the findings,
input policies, and actual author/reviewer/scribe contributions as a team.
No group contribution is established by the automated tool results alone.

## Manual review findings

`Fixed` means the correction is present in `fixed_receipt.ts`, not that the
original file has been edited. Local execution results and screenshot
references are recorded in the verification section below.

| ID | Location | Issue | Explanation | Suggested fix | Status |
| --- | --- | --- | --- | --- | --- |
| M01 | `receipt.ts:12` | Sparse entry in `ITEMS` | The extra comma creates an array hole rather than a grocery item. Iterating values can produce `undefined`; accessing an item property would then be unsafe. | Remove the empty array entry and keep only actual grocery items. | Fixed |
| M02 | `receipt.ts:17` | Invalid object literal syntax | Object properties use `:` rather than `=`. This prevents parsing/compilation. | Use `{ name, price }` or `{ name: name, price: price }`. | Fixed |
| M03 | `receipt.ts:22` | Incorrect lookup for a named item | `ITEMS` contains objects, but `indexOf("name")` looks for a literal string. It does not compare each object's name with the argument. | Use `findIndex((item) => item.name === name)` after validating the name. | Fixed |
| M04 | `receipt.ts:22–24` | The requested item is not deleted | `idx` is unused. `pop()` removes the final element, regardless of the requested name, including when no item matches. | When the matching index is not `-1`, use `splice(index, 1)`; otherwise leave the list unchanged. | Fixed |
| M05 | `receipt.ts:28` | Invalid and hard-coded iteration target | The number `3` is not iterable. It also does not describe the grocery list, whose size changes when items are added or deleted. | Iterate over the actual items or reduce the array. | Fixed |
| M06 | `receipt.ts:29–31` | The function name is used as a numeric accumulator | `total` refers to the function, not to a subtotal initialized to zero. The expression and assignment cannot correctly calculate a monetary sum. | Use a separate numeric accumulator or `reduce`, starting from zero, and return the computed subtotal. | Fixed |
| M07 | `receipt.ts:35` | The tax rate is added as a currency amount | A decimal rate is not a dollar amount. For a 10% example, adding `0.10` to the subtotal would add ten cents rather than ten percent. | Calculate the tax amount from `subtotal * taxRate`, then add it to the subtotal for the grand-total return value. | Fixed |
| M08 | `receipt.ts:42–43` | Item objects are treated as array indices | A `for...of` loop over `ITEMS` produces item objects. Using those objects as `ITEMS[i]` indices cannot select the intended product. | Read the loop value directly as `item.name` and `item.price`. | Fixed |
| M09 | `receipt.ts:43` | Interpolation is inside a plain string | Single quotes keep `${...}` as literal text. The expression also has invalid property references and an extra closing brace. | Use a backtick template literal with `${item.name}` and `${item.price.toFixed(2)}`. | Fixed |
| M10 | `receipt.ts:47` | The subtotal function is converted to text instead of called | `String(total)` represents the function, not its numeric result. | Call `total()` and format the returned number to two decimal places. | Fixed |
| M11 | `receipt.ts:48–49` | Mismatched string delimiters | The strings start with a backtick and end with a double quote, causing unterminated or incorrectly parsed expressions. | Use matching backticks for both template literals. | Fixed |
| M12 | `receipt.ts:48` | The tax line prints a rate rather than a tax amount | The receipt should distinguish the percentage rate from the amount of tax charged. For the test fixture, the amount is $4.75, not 0.10. | Print the monetary difference between the grand total and subtotal. | Fixed |
| M13 | `receipt.ts:49` | A string is passed to a numeric parameter | `String(taxRate)` changes the argument to a string although `tax()` expects a number. | Pass `taxRate` directly and format only the final display value. | Fixed |

## Additional robustness and clarity improvements

The starter does **not** specify every invalid-input or rounding behavior.
The following are explicit implementation policies, not claims that the
instructor required these exact decisions. Discuss them as a team.

| ID | Location | Issue | Explanation | Suggested fix | Status |
| --- | --- | --- | --- | --- | --- |
| P01 | `addItem()`, `deleteItem()`, `tax()`, `printReceipt()` | Invalid-input behavior is unspecified | Blank names, negative/non-finite prices, and invalid rates need a consistent policy for unhappy-path tests. | Reject blank/non-string names; reject negative/non-finite prices; use decimal tax rates from 0 through 1. Validate before mutation or output. | Fixed |
| P02 | Monetary storage, calculation, and printing | Rounding and formatting are unspecified | Printed values and totals should agree, including small decimal prices and half-cent tax rounding. Extremely large values cannot be handled safely with ordinary integer-cent arithmetic. | Normalize incoming prices to cents, sum in cents, round tax to cents, reject unsafe amounts, and print two decimal places. | Fixed |
| P03 | `deleteItem()` return value | The live array is exposed | Returning the internal objects would allow a caller to alter the grocery list without using its operations. | Return a copied array containing copied item objects. | Fixed |

## Root cause, error, defect, and failure

| Concept | Example | Evidence qualification |
| --- | --- | --- |
| Root cause | A misunderstanding of array search/removal methods could explain why the author selected `indexOf("name")` and `pop()` for deletion by name. | This is a plausible underlying cause inferred from the code. The author's actual reasoning is unknown. |
| Error | Choosing `pop()` when attempting to implement deletion of a specific named product would be the incorrect human action. | This is an explanatory example, not an observed action by a named student. |
| Defect | `ITEMS.pop()` runs unconditionally in `deleteItem()`, and the calculated index is not used. | This is directly visible in original lines 22–23. |
| Failure | After syntax problems are removed, calling the original deletion logic with `"eggs"` would remove the last item, `"avocado oil"`, and leave `"eggs"` in the list. | This is the predicted observable behavior of that logic. The unchanged original cannot execute because it does not parse; this deletion failure was not observed in a run of the unchanged file. |

The observed local original-code Jest run stopped at TypeScript diagnostics
in `receipt.test.ts`: TS18048 at 109:36 and 147:39, and TS2532 at 154:5.
The test import targeted `./receipt`. Jest reported one failed suite and
zero executed tests. This is a suite-startup failure, not 40 failed assertions
and not an observed execution of the original deletion behavior.

## Automated static analysis — local results

Command: `npx eslint receipt.ts`

Run date: October 9, 2026.

Source reviewed: The unchanged original `receipt.ts`.

### Observed ESLint output

```text
receipt.ts
  17:27  error  Parsing error: ':' expected

✖ 1 problem (1 error, 0 warnings)
```

### Interpretation

ESLint reported a parsing error at line 17, column 27. This diagnostic
corresponds to manual review finding **M02 — Invalid object literal syntax**:
the original code uses `=` where an object property requires `:`.

Because this finding is already documented as M02, it is referenced here
rather than added as a duplicate issue.

The parsing error prevented ESLint from completing its normal lint checks.
No additional findings were reported in this run, but this does not mean
that the original code contains no other defects.

The original `receipt.ts` was left unchanged.

### Evidence

Screenshot: `screenshots/02-eslint-original.png`

## Local verification results

Run date: October 9, 2026.

The results below are recorded from the local terminal captures. The three
required screenshot files are present in the project Explorer capture.

| Check | Command and target | Observed local result | Evidence |
| --- | --- | --- | --- |
| Original-code Jest run | `npx jest receipt.test.ts`, importing `./receipt` | Suite failed to run because of TypeScript diagnostics in `receipt.test.ts`; 1 failed suite and 0 tests executed. | `screenshots/01-tests-before.png` |
| Original-code ESLint run | `npx eslint receipt.ts` | 1 error and 0 warnings; `Parsing error: ':' expected` at 17:27. Normal lint checks were blocked by the parsing error. | `screenshots/02-eslint-original.png` |
| Corrected-code Jest run | `npx jest receipt.test.ts`, importing `./fixed_receipt` | 1 test suite passed; all 40 tests passed. | `screenshots/03-tests-after.png` |
| Corrected-code ESLint run | `npm run lint:fixed` → `eslint fixed_receipt.ts receipt.test.ts` | Completed with no errors or warnings reported and returned to the terminal prompt. | Local terminal capture showing the command and return to the prompt. |
| Corrected-code TypeScript check | `npm run typecheck` → `tsc --noEmit` | Completed with no TypeScript errors reported and returned to the terminal prompt. | Local terminal capture showing the command and return to the prompt. |

The final test import is `./fixed_receipt`. The TypeScript project includes
`fixed_receipt.ts` and `receipt.test.ts`; the defective original is excluded
from that final check and is not imported by the corrected test run.

The passing results establish the outcomes of these checks, not the absence
of every possible defect or the completion of the team's review process.
