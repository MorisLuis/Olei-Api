

interface StatisticsCRMDashboardResponse {
    eventsToday: number;
    sellsToday: number;
    eventsWeek: number;
    sellsWeek: number;

    productsSoldMonth: number;
    sellerOfMonth: number;

    sells: { period: number, sellsByMonth: number }[];
    cobranza: { type: string, sumCobranzaExpired: number, sumCobranza: number }[];
};


export type {
    StatisticsCRMDashboardResponse
}