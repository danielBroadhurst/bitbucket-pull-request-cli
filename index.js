#! /usr/bin/env node
const fetch = require("node-fetch");

async function generateUrlRequest(title, branch) {
  const workspace = "danielbroadhurst1986";
  const repoSlug = "node-cli";
  const bitBucketPass = "eYnmPPVKqXcrNGzdZYNm";
  const pullRequestUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests`;
  const data = {
    title: title,
    source: {
      branch: {
        name: branch,
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
          const title = yield requestPullRequestTitle();
          const response = yield generateUrlRequest(title, branch);
          console.log(branch, title, response);
        } catch (error) {
          console.log({ error });
        }
      }
      function requestPullRequestTitle() {
        readline.question(`Enter the title for the pull request? `, (title) => {
          actionIt.next(title);
        });
      }
      readline.question(
        `Which branch would you like to create a PR for? `,
        (branch) => {
          actionIt = actionGenerator();
          actionIt.next();
          actionIt.next(branch);
          readline.prompt();
        }
      );
      break;
  }
});

function getComments(branch) {
  console.log(branch, "comment");
  return branch;
}
