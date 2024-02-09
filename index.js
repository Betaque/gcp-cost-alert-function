const IncomingWebhook = require("@slack/client").IncomingWebhook;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

const eventToBilling = (data) => {
  return JSON.parse(Buffer.from(data, "base64").toString());
};

const createSlackMessage = (pubsubMessage) => {
  return {
    text: `Budget Amount: ${pubsubMessage.budgetAmount}, Cost Amount: ${pubsubMessage.costAmount}, Budget: ${pubsubMessage.budgetDisplayName}`,
    mrkdwn: true,
  };
};

exports.subscribe = (event, callback) => { 
  const pubsubMessage = eventToBilling(event.data);

  console.log("Budget Amount:", pubsubMessage.budgetAmount);
  console.log("Cost Amount:", pubsubMessage.costAmount);
  console.log("Budget Display Name:", pubsubMessage.budgetDisplayName);

  if (pubsubMessage.costAmount >= pubsubMessage.budgetAmount) {
    const message = createSlackMessage(pubsubMessage);
    webhook.send(message, (err, res) => {
      if (err) {
        console.log("Cannot send message to Slack:", err);
        callback(err);
      } else {
        console.log("Message sent to Slack successfully:", res);
        callback();
      }
    });
  } else {
    console.log("Cost amount is within budget. No notification sent.");
    
  }
};
