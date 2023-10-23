export type InitializePaymentGatewayResponse<TData = unknown> = {
  data: TData;
};

export type InitializeTransactionSessionResult =
  | "AUTHORIZATION_ACTION_REQUIRED"
  | "AUTHORIZATION_FAILURE"
  | "AUTHORIZATION_REQUEST"
  | "AUTHORIZATION_SUCCESS"
  | "CHARGE_ACTION_REQUIRED"
  | "CHARGE_FAILURE"
  | "CHARGE_REQUEST"
  | "CHARGE_SUCCESS";

export type InitializeTransactionSessionAction = "CHARGE" | "REFUND" | "CANCEL";

export type InitializeTransactionSessionResponse<TData = unknown> = {
  pspReference: string; // "<psp reference received from payment provider>";
  result: InitializeTransactionSessionResult;
  amount: number; // TODO: check decimal or number! "<Decimal amount of the processed action>";
  data?: TData; // TODO: double check the type! "<[Optional] JSON data tha will be returned to storefront>";
  time?: string; // TODO: double check the type "<[Optional] time of the action>";
  externalUrl?: string; // "<[Optional] external url with action details.";
  message?: string; // "<[Optional] message related to the action>";
  actions?: InitializeTransactionSessionAction;
};
