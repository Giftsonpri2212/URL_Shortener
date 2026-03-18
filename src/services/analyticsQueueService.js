const { analyticsQueue } = require("../config/bullmq");

async function enqueueClickAnalytics(payload) {
  await analyticsQueue.add("click-event", payload);
}

module.exports = {
  enqueueClickAnalytics
};
