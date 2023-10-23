import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { TransactionInitializeSessionEventPayloadFragment } from "../../../../generated/graphql";
import { InitializeTransactionSessionResponse } from "../../../payment-gateways/types";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: OrderCreatedWebhookPayloadFragment
 */
const TransactionInitializeSessionEventPayload = gql`
  fragment TransactionInitializeSessionEventPayload on TransactionInitializeSession {
    __typename
    data
    action {
      amount
      currency
      actionType
    }
    issuingPrincipal {
      ... on Node {
        id
      }
    }
    sourceObject {
      __typename
      ... on Checkout {
        id
        channel {
          id
          slug
        }
        languageCode
        total: totalPrice {
          gross {
            amount
          }
        }
      }
      ... on Order {
        id
        channel {
          id
          slug
        }
        languageCodeEnum
        userEmail
        total {
          gross {
            amount
          }
        }
      }
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const TransactionInitializeSessionSubscription = gql`
  # Payload fragment must be included in the root query
  ${TransactionInitializeSessionEventPayload}
  subscription TransactionInitializeSession {
    event {
      ...TransactionInitializeSessionEventPayload
    }
  }
`;

/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * orderCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionEventPayloadFragment>({
    webhookPath: "api/webhooks/transaction-initialize",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionSubscription,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default transactionInitializeSessionWebhook.createHandler((req, res, ctx) => {
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

  console.log(
    "TRANSACTION INITIALIZE SESSION",
    parseFloat(payload.action.amount),
    payload.action.amount,
    payload.data.status
  );

  const response: InitializeTransactionSessionResponse = {
    pspReference: "1234-dummy",
    result: payload.data.status === "CHARGE_SUCCESS" ? "CHARGE_SUCCESS" : "CHARGE_FAILURE",
    amount: parseFloat(payload.action.amount), // TODO: Make it roboust
    data: {
      // status: "all clear!",
      paymentResponse: {
        resultCode: "Authorised",
      },
    },
    message: "Optional message",
  };

  return res.status(200).json(response);
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
