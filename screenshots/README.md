# Required screenshots

Capture these from your own actual local runs. No screenshots are supplied.

| Filename | Required evidence |
| --- | --- |
| `01-tests-before.png` | `npx jest receipt.test.ts` while the import targets `./receipt`; capture the actual compile/test failure. |
| `02-eslint-original.png` | `npx eslint receipt.ts` against the unchanged starter. |
| `03-tests-after.png` | `npx jest receipt.test.ts` after restoring the import to `./fixed_receipt`; show the passing suite/test summary. |

On macOS, use Shift + Command + 4 to capture the relevant terminal area. Rename
the image and move it into this folder. Show enough context to identify the
command and outcome. More than one image per stage is fine when output is long.
Never treat this README as a replacement for the required images.
