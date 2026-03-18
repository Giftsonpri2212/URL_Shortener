const env = require("../config/env");
const urlModel = require("../models/urlModel");

class QuotaExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = "QuotaExceededError";
    this.statusCode = 403;
  }
}

function getQuotaForPlan(planType) {
  if (planType === "pro") {
    return env.proPlanQuota;
  }

  return env.freePlanQuota;
}

async function ensureQuotaAvailable({ userId, planType }) {
  const quota = getQuotaForPlan(planType);
  const usedCount = await urlModel.countByUserId(userId);

  if (usedCount >= quota) {
    throw new QuotaExceededError(`Quota exceeded for ${planType} plan`);
  }

  return {
    planType,
    quota,
    used: usedCount,
    remaining: quota - usedCount
  };
}

module.exports = {
  ensureQuotaAvailable,
  getQuotaForPlan,
  QuotaExceededError
};
