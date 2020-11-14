#! /usr/bin/env node
const fetch = require("node-fetch");

async function generateUrlRequest() {
  const workspace = "danielbroadhurst1986";
  const repoSlug = "node-cli";
  const bitBucketPass = "eYnmPPVKqXcrNGzdZYNm";
  const pullRequestUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests`;
  const data = {
    title: "My First Pull Request",
    source: {
      branch: {
        name: "dev",
      },
    },
    destination: {
      branch: {
        name: "master",
      },
    },
  };
  try {
    const response = await fetch(pullRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${workspace}:${bitBucketPass}`
        ).toString("base64")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    console.log(json);
    return json;
  } catch (error) {
    console.log(error);
  }
}

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
          const comments = yield generateUrlRequest();
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
