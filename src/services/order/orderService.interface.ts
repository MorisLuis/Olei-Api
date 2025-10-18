

import type OrderInterface from "../../interface/order";
import type { SellsDetailsInterface, SellsInterface } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";


// PARAMS

interface PostOrderServiceParams {
    userSession: UserWebSessionInterface;
    Total: number;
    Subtotal: number;
    sellsDetails: Partial<SellsDetailsInterface>[];
    sellsData: Partial<SellsInterface>;
};

interface GetOrderServiceParams {
    userSession: UserWebSessionInterface;
    folio: string;
};

interface GetAllOrdersServiceParams {
    userSession: UserWebSessionInterface;
    page: number;
    limit: number;
};


interface GetOrderDetailsSellsParams {
    PageNumber: number;
    folio: string;
    TipoDoc: number;
    userSession: UserWebSessionInterface;
};

interface GetTotalOrderDetailsSellsParams {
    folio: string;
    TipoDoc: number;
    userSession: UserWebSessionInterface;
};


// RESPONSE

interface PostOrderServiceResponse {
    folio: string
    TipoDoc: number
};

interface GetOrderServiceResponse {
    order: OrderInterface
};

interface GetAllOrdersServiceResponse {
    allOrders: OrderInterface[]
};

interface GetOrderDetailsSellsResponse {
    orderDetails: SellsDetailsInterface[]
};


interface GetTotalOrderDetailsSellsResponse {
    total: number
};



export type {
    PostOrderServiceParams,
    GetOrderServiceParams,
    GetAllOrdersServiceParams,
    GetOrderDetailsSellsParams,
    GetTotalOrderDetailsSellsParams,

    PostOrderServiceResponse,
    GetOrderServiceResponse,
    GetAllOrdersServiceResponse,
    GetOrderDetailsSellsResponse,
    GetTotalOrderDetailsSellsResponse
}