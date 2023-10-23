import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphql-client";
import { PaymentGatewayInitializeSessionEventPayloadFragment } from "../../../../generated/graphql";

const PaymentGatewayInitializeSessionEventPayload = gql`
  fragment PaymentGatewayInitializeSessionEventPayload on PaymentGatewayInitializeSession {
    __typename
    data
    amount
    issuingPrincipal {
      ... on Node {
        id
      }
    }
    sourceObject {
      __typename
      ... on Checkout {
        id
        email
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
    }
  }
`;

const PaymentGatewayInitializeSessionSubscription = gql`
  # Payload fragment must be included in the root query
  ${PaymentGatewayInitializeSessionEventPayload}
  subscription PaymentGatewayInitializeSession {
    event {
      ...PaymentGatewayInitializeSessionEventPayload
    }
  }
`;

export const initializeSessionWebhook =
  new SaleorSyncWebhook<PaymentGatewayInitializeSessionEventPayloadFragment>({
    webhookPath: "api/webhooks/initialize-session",
    event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: PaymentGatewayInitializeSessionSubscription,
  });

export default initializeSessionWebhook.createHandler((req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;

  console.log("INITIALIZE SESSION called");

  // Use authData to create authenticated GraphQL client
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  // Fetch customer credit balance from Saleor API
  // Although it is possible to keep that data in the user metadata, for production deployment I would recommend
  // database or 3rd party service to store that data.

  return res.status(200).json({
    data: {
      // Here you can pass additional data which will be available in the frontend
      availableCredits: 10000,
    },
  });
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
