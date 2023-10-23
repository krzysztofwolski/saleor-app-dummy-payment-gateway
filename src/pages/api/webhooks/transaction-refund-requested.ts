import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphql-client";
import { TransactionRefundRequestedEventPayloadFragment } from "../../../../generated/graphql";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: OrderCreatedWebhookPayloadFragment
 */
const TransactionRefundRequestedEventPayload = gql`
  fragment TransactionRefundRequestedEventPayload on TransactionRefundRequested {
    __typename
    issuingPrincipal {
      ... on Node {
        id
      }
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const TransactionRefundRequestedSubscription = gql`
  # Payload fragment must be included in the root query
  ${TransactionRefundRequestedEventPayload}
  subscription TransactionRefundRequested {
    event {
      ...TransactionRefundRequestedEventPayload
    }
  }
`;

/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * orderCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const transactionRefundRequestedWebhook =
  new SaleorSyncWebhook<TransactionRefundRequestedEventPayloadFragment>({
    webhookPath: "api/webhooks/transaction-refund-requested",
    event: "TRANSACTION_REFUND_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionRefundRequestedSubscription,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default transactionRefundRequestedWebhook.createHandler((req, res, ctx) => {
  const {
    /**
     * Access payload from Saleor - defined above
     */
    payload,
    /**
     * Saleor event that triggers the webhook (here - ORDER_CREATED)
     */
    event,
    /**
     * App's URL
     */
    baseUrl,
    /**
     * Auth data (from APL) - contains token and saleorApiUrl that can be used to construct graphQL client
     */
    authData,
  } = ctx;

  console.log("TRANSACTION REFUND REQUESTED");

  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  /**
   * Now you can fetch additional data using urql.
   * https://formidable.com/open-source/urql/docs/api/core/#clientquery
   */

  // const data = await client.query().toPromise()

  /**
   * Inform Saleor that webhook was delivered properly.
   */
  return res.status(200).end();
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
