import { Vehicle } from '../types';

interface MarketAnalysisResult {
    query: string;
    count: number;
    min_price: number;
    max_price: number;
    avg_price: number;
    median_price: number;
    suggested_trade_in: number;
    currency: string;
    sample_links: string[];
}

// TODO: Replace with actual Cloud Function URL after deployment
const CLOUD_FUNCTION_URL = "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/analista_mercado";

export const analyzeMarketPrice = async (vehicle: Vehicle): Promise<MarketAnalysisResult> => {
    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error analyzing market: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Market analysis failed:", error);
        throw error;
    }
};
