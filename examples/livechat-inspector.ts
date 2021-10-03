#!/usr/bin/env/node

import { Masterchat, asString, SuperChat } from "masterchat";
import chalk from "chalk";

function log(...obj: any) {
  console.log(...obj);
}

function chalkSc(color: SuperChat["color"]) {
  switch (color) {
    case "blue":
      return chalk.blue;
    case "green":
      return chalk.green;
    case "lightblue":
      return chalk.blueBright;
    case "magenta":
      return chalk.magenta;
    case "orange":
      return chalk.yellowBright;
    case "red":
      return chalk.red;
    case "yellow":
      return chalk.yellow;
  }
}

async function main({ videoIdOrUrl }: { videoIdOrUrl: string }) {
  const mc = await Masterchat.init(videoIdOrUrl, {
    credentials,
  });

  mc.on("data", (data) => {
    const { actions, continuation } = data;
    log("token", continuation?.token);
    log("timeoutMs", continuation?.timeoutMs);
    log(
      "now",
      new Date(),
      "next",
      continuation?.timeoutMs && new Date(Date.now() + continuation.timeoutMs)
    );
    log("actions", actions.length);
    for (const action of actions) {
      switch (action.type) {
        case "addChatItemAction": {
          log(
            chalk.gray(`${action.authorChannelId} ${action.authorName}:`),
            asString(action.rawMessage)
          );
          break;
        }
        case "addSuperChatItemAction": {
          log(
            chalkSc(action.superchat.color)(`$$$$$$$$$$$$$$$$$
${action.authorName}: ${action.superchat.amount} ${
              action.superchat.currency
            } (${action.superchat.color})
${asString(action.rawMessage ?? "<empty message>")}
$$$$$$$$$$$$$$$$$`)
          );
          break;
        }
        case "addMembershipItemAction": {
          log(
            chalk.green(`=================
Welcome${action.level ? ` ${action.level},` : ""} ${action.authorName} !
${action.membership.status} ${action.membership.since ?? ""}
=================`)
          );
          break;
        }
        case "addMembershipMilestoneItemAction": {
          log(
            chalk.green(`=================
${action.authorName} (${action.membership.status} ${
              action.membership.since ?? ""
            })
Member${action.level ? ` of ${action.level}` : ""} for ${
              action.durationText
            } (${action.duration})
${action.message ? asString(action.message) : "<empty message>"}
=================`)
          );
          break;
        }
        case "addBannerAction": {
          log(
            chalk.blue(`=================
${asString(action.title)}
${asString(action.message)}
${action}
=================`)
          );
          break;
        }
        case "addViewerEngagementMessageAction": {
          log(
            chalk.red(`=================
[${action.icon.iconType}] ${asString(action.message)}
=================`)
          );
          break;
        }
        case "modeChangeAction": {
          log(
            chalk.cyan(`=================
[${action.mode} = ${action.enabled}] ${asString(action.description)}
=================`)
          );
          break;
        }
        case "showLiveChatActionPanelAction": {
          console.log(JSON.stringify(action));
          log(
            chalk.cyan(`=================
[open ${action.targetId}]
${action.contents.pollRenderer.choices.map((choice, i) => {
  return `${i + 1}: ${choice.text} ${choice.votePercentage} ${
    choice.voteRatio
  } ${choice.selected}\n`;
})}
${action.contents.pollRenderer.header.pollHeaderRenderer.liveChatPollType}
${asString(action.contents.pollRenderer.header.pollHeaderRenderer.metadataText)}
${asString(action.contents.pollRenderer.header.pollHeaderRenderer.pollQuestion)}
=================`)
          );
          break;
        }
        case "updateLiveChatPollAction": {
          log(
            chalk.cyan(`=================
${action.choices.map((choice, i) => {
  return `${i + 1}: ${choice.text} ${choice.votePercentage} ${
    choice.voteRatio
  } ${choice.selected}\n`;
})}
${action.header.pollHeaderRenderer.liveChatPollType}
${asString(action.header.pollHeaderRenderer.pollQuestion)}
${asString(action.header.pollHeaderRenderer.metadataText)}
=================`)
          );
          break;
        }
        case "closeLiveChatActionPanelAction": {
          log(
            chalk.cyan(`=================
[close ${action.targetPanelId}]
${action.skipOnDismissCommand}
=================`)
          );
          break;
        }
        case "markChatItemAsDeletedAction": {
          log(
            chalk.bgYellow.black(`=================
[delete ${action.targetId} retracted=${action.retracted}]
=================`)
          );
          break;
        }
        case "markChatItemsByAuthorAsDeletedAction": {
          log(
            chalk.bgRed(`=================
[ban ${action.channelId}]
=================`)
          );
          break;
        }
      }
    }
  });

  mc.on("error", (err) => console.log("ERROR", err));
  mc.on("end", () => console.log("END"));

  mc.listen();
}

const videoIdOrUrl = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoIdOrUrl) {
  throw new Error("missing videoId or URL");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoIdOrUrl });
