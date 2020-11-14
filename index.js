#! /usr/bin/env node
const fetch = require("node-fetch");
// eslint-disable-next-line no-unused-vars
const colors = require("colors");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const package = require("./package.json");

function generateUrlRequest(title, branch, user) {
  const workspace = user;
  const repoSlug = package.name;
  const bitBucketPass = "eYnmPPVKqXcrNGzdZYNm";
  const pullRequestUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests`;
  const data = {
    title: title,
    description: "TEST DESCRIPTIONSsws",
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
            const user = yield;
            const branch = yield requestBranch();
            const title = yield requestTitle();
            const response = yield createRequest(title, branch, user);
            console.log(
              `Pull Request Created: ${response.links.html.href}`.green
            );
            readline.prompt();
          } catch (error) {
            console.log(error.red);
          }
        };
        const requestBranch = function requestPullRequestBranch() {
          readline.question(
            `Which branch would you like to create a PR for? `,
            (branch) => {
              actionIt.next(branch);
            }
          );
        };
        const requestTitle = function requestPullRequestTitle() {
          readline.question(
            `Enter the title for the pull request? `,
            (title) => {
              actionIt.next(title);
            }
          );
        };
        const createRequest = async function createPullRequest(
          title,
          branch,
          user
        ) {
          const details = generateUrlRequest(title, branch, user);
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
            if (response.ok) {
              const json = await response.json();
              return actionIt.next(json);
            } else {
              throw response;
            }
          } catch (error) {
            let message = `${error.status}: ${error.statusText}`;
            if (error.status === 400) {
              const errorMessage = await error.json();
              message += ` - ${errorMessage.error.message}`;
            }
            actionIt.throw(message);
          } finally {
            readline.prompt();
          }
        };
        readline.question(
          `Enter you user or workspace where the repo is held? `,
          (user) => {
            actionIt = actionGen();
            actionIt.next();
            actionIt.next(user);
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
