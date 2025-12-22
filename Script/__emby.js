let body = {};

if ($request.url.includes("/admin/service/registration/validateDevice")) {
  body = {
    "cacheExpirationDays": 99,
    "message": "Device Valid",
    "resultCode": "GOOD",
  };
} else if ($request.url.includes("/admin/service/appstore/register")) {
  body = {
    featId: "",
    registered: true,
    expDate: "2099-01-01",
    key: "",
  };
} else if ($request.url.includes("/admin/service/registration/validate")) {
  body = {
    featId: "",
    registered: true,
    expDate: "2099-01-01",
    key: "",
  };
} else if ($request.url.includes("/admin/service/registration/getStatus")) {
  body = {
    planType: "Test",
    deviceStatus: "",
    subscriptions: [],
  };
} else if ($request.url.includes("/admin/service/supporter/retrievekey")) {
  body = {
    Success: false,
    ErrorMessage: "Test",
  };
}

$done({
  status: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Method": "*",
    "Access-Control-Allow-Credentials": "true",
  },
  body: JSON.stringify(body),
});
