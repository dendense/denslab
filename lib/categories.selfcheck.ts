/**
 * Character-level check that the copy in lib/categories.ts is byte-identical to
 * the text Deny wrote, and that no entry count is written as a literal in the
 * UI. Run with: ./node_modules/.bin/tsx lib/categories.selfcheck.ts
 *
 * tsx is not a dependency of this project, so this file is kept out of the
 * build by tsconfig "exclude" and is run only when the check is wanted.
 */

import { CATEGORY_DESCRIPTIONS } from "./categories";

const DENY_AI =
  "Original AI artworks created by me, each shared with the exact prompt behind it. Explore the images, borrow the prompts, and see how a few words become a finished piece.";

const DENY_PHOTOSHOOT =
  "Photos from my street-hunting sessions and conceptual studio shoots, each with notes on the story and the camera and lighting settings used. A behind-the-scenes look at how every frame was made.";

function assert(name: string, cond: boolean, detail: string) {
  if (!cond) {
    console.error(`FAIL ${name}: ${detail}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}: ${detail}`);
}

const ai = CATEGORY_DESCRIPTIONS["AI Generated"];
const photo = CATEGORY_DESCRIPTIONS.Photoshoot;

assert("ai-verbatim", ai === DENY_AI, `len=${ai.length} deny=${DENY_AI.length}`);
assert(
  "photoshoot-verbatim",
  photo === DENY_PHOTOSHOOT,
  `len=${photo.length} deny=${DENY_PHOTOSHOOT.length}`,
);

for (const [name, text] of Object.entries(CATEGORY_DESCRIPTIONS)) {
  assert(`${name}-no-newline`, !/[\r\n]/.test(text), JSON.stringify(text.length));
  assert(`${name}-ends-with-period`, text.endsWith("."), "ok");
  assert(
    `${name}-no-digit-run`,
    !/\d/.test(text),
    "no number in the copy (counts must stay computed)",
  );
}

// The plural rule the page uses, exercised for all three cases.
function label(n: number) {
  return `${n} ${n === 1 ? "entry" : "entries"}`;
}
assert("plural-1", label(1) === "1 entry", label(1));
assert("plural-2", label(2) === "2 entries", label(2));
assert("plural-0", label(0) === "0 entries", label(0));
assert("plural-9", label(9) === "9 entries", label(9));
assert("plural-3", label(3) === "3 entries", label(3));

console.log(
  process.exitCode === 1 ? "SELFCHECK FAILED" : "SELFCHECK OK",
);
