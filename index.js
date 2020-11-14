#! /usr/bin/env node
const fetch = require("node-fetch");
// eslint-disable-next-line no-unused-vars
const colors = require("colors");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

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
    case "eslint":
      {
        const eslint = async function eslint() {
          try {
            const { stdout } = await exec("eslint index.js --fix");
            if (stdout === "") {
              console.log("No errors or warnings found");
            }
          } catch (error) {
            console.log(error.stdout.toString());
          } finally {
            readline.prompt();
          }
        };
        eslint();
      }
      break;
    case "cpr":
      {
        let actionIt;
        const actionGen = function* actionGenerator() {
          try {
            const branch = yield;
            const title = yield requestTitle();
            const response = yield createRequest(title, branch);
            console.log(
              `Pull Request Created: ${response.links.html.href}`.green
            );
            readline.prompt();
          } catch (error) {
            console.log({ error });
          }
        };
        const requestTitle = function requestPullRequestTitle() {
          readline.question(
            `Enter the title for the pull request? `,
            (title) => {
              actionIt.next(title);
            }
          );
        };
        const createRequest = async function createPullRequest(title, branch) {
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
        };
        readline.question(
          `Which branch would you like to create a PR for? `,
          (branch) => {
            actionIt = actionGen();
            actionIt.next();
            actionIt.next(branch);
            readline.prompt();
          }
        );
      }
      break;
    case "exit":
      return process.exit();
    default:
      readline.prompt();
  }
});
