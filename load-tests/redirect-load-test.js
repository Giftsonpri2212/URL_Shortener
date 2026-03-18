import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  iterations: 10000,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SHORT_CODE = __ENV.SHORT_CODE || "abc";

export default function () {
  const response = http.get(`${BASE_URL}/${SHORT_CODE}`, {
    redirects: 0
  });

  check(response, {
    "status is redirect": (r) => r.status === 301 || r.status === 302,
    "has location header": (r) => Boolean(r.headers.Location)
  });

  sleep(0.05);
}
