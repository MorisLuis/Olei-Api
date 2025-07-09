

interface StatisticsCRMDashboardResponse {
    eventsWeek: number;
    sellsWeek: number;

    productsSoldMonth: number;
    sellerOfMonth: number;

    sells: SellsMontlyStatistics[];
    sellsToday: SellsStatistics;
    cobranza: { type: string, sumCobranzaExpired: number, sumCobranza: number }[];
};

interface SellsStatistics {
    sellsByMonthCredit: number, 
    sellsByMonthContado: number, 
    sellsTotal: number
}

interface SellsMontlyStatistics extends SellsStatistics {
    period: string, 
}


export type {
    StatisticsCRMDashboardResponse
}