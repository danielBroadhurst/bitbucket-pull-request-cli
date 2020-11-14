#! /usr/bin/env node
const fetch = require("node-fetch");

function generateUrlRequest(title, branch) {
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
  const details = { workspace, bitBucketPass, pullRequestUrl, data };
  return details;
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
          const response = yield createPullRequest(title, branch);
          console.log(`Pull Request Created: ${response.links.html.href}`);
          readline.prompt();
        } catch (error) {
          console.log({ error });
        }
      }
      function requestPullRequestTitle() {
        readline.question(`Enter the title for the pull request? `, (title) => {
          actionIt.next(title);
        });
      }
      async function createPullRequest(title, branch) {
        const details = generateUrlRequest(title, branch);
        try {
          const response = await fetch(details.pullRequestUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(
                `${details.workspace}:${details.bitBucketPass}`
              ).toString("base64")}`,
            },
            body: JSON.stringify(details.data),
          });
          const json = await response.json();
          actionIt.next(json);
        } catch (error) {
          actionIt.throw(error);
        }
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
    default:
      readline.prompt();
  }
});

function getComments(branch) {
  console.log(branch, "comment");
  return branch;
}
