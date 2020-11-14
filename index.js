#! /usr/bin/env node
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "enter command > ",
});
readline.prompt();
readline.on("line", async (line) => {
  switch (line.trim()) {
    case "cpr":
      let actionIt;
      function* actionGenerator() {
        try {
          const branch = yield;
          const comments = yield checkComments();
          console.log(comments);
        } catch (error) {
          console.log({ error });
        }
      }
      function checkComments() {
        readline.question(
          `How many servings did you eat? ( as a decimal: 1, 0.5, 1.25, etc.. ) `,
          (servingSize) => {
            actionIt.next(servingSize);
          }
        );
      }
      readline.question(`What would you like to log today? `, (branch) => {
        actionIt = actionGenerator();
        actionIt.next();
        actionIt.next(branch);
        readline.prompt();
      });
      break;
  }
});

function getComments(branch) {
  console.log(branch, "comment");
  return branch;
}
