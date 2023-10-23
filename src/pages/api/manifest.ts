import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { initializeSessionWebhook } from "./webhooks/initialize-session";
import { transactionCancelationRequestedWebhook } from "./webhooks/transaction-cancelation-requested";
import { transactionChargeRequestedWebhook } from "./webhooks/transaction-charge-requested";
import { transactionInitializeSessionWebhook } from "./webhooks/transaction-initialize";
import { transactionProcessSessionWebhook } from "./webhooks/transaction-process";
import { transactionRefundRequestedWebhook } from "./webhooks/transaction-refund-requested";

/**
 * App SDK helps with the valid Saleor App Manifest creation. Read more:
 * https://github.com/saleor/saleor-app-sdk/blob/main/docs/api-handlers.md#manifest-handler-factory
 */
export default createManifestHandler({
  async manifestFactory({ appBaseUrl, request }) {
    const iframeBaseUrl = process.env.APP_IFRAME_BASE_URL ?? appBaseUrl;
    const apiBaseUrl = process.env.APP_API_BASE_URL ?? appBaseUrl;

    const tokenTargetUrl = new URL("api/register", apiBaseUrl).href;
    const logoUrl = new URL("logo.png", apiBaseUrl).href;

    const manifest: AppManifest = {
      name: "Dummy Payments",
      tokenTargetUrl,
      appUrl: iframeBaseUrl,
      permissions: ["HANDLE_PAYMENTS", "HANDLE_CHECKOUTS", "MANAGE_ORDERS", "MANAGE_USERS"],
      id: "saleor.app.dummy-payments-app",
      version: packageJson.version,
      webhooks: [
        initializeSessionWebhook.getWebhookManifest(apiBaseUrl),
        transactionCancelationRequestedWebhook.getWebhookManifest(apiBaseUrl),
        transactionChargeRequestedWebhook.getWebhookManifest(apiBaseUrl),
        transactionInitializeSessionWebhook.getWebhookManifest(apiBaseUrl),
        transactionProcessSessionWebhook.getWebhookManifest(apiBaseUrl),
        transactionRefundRequestedWebhook.getWebhookManifest(apiBaseUrl),
      ],
      extensions: [],
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: logoUrl,
        },
      },
    };

    return manifest;
  },
});
