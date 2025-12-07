import functions_framework
import requests
import statistics

@functions_framework.http
def market_analysis(request):
    """
    Cloud Function to analyze vehicle market prices using MercadoLibre API.
    Expects JSON body: { "make": "Toyota", "model": "Corolla", "year": 2020 }
    """
    # CORS Headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '3600'
    }

    # Handle Preflight Request
    if request.method == 'OPTIONS':
        return ('', 204, cors_headers)

    request_json = request.get_json(silent=True)
    
    if not request_json:
        return ({"error": "Invalid JSON"}, 400, cors_headers)
        
    make = request_json.get('make')
    model = request_json.get('model')
    year = request_json.get('year')
    
    if not make or not model:
        return ({"error": "Make and Model are required"}, 400, cors_headers)
        
    # 1. Search in MercadoLibre
    # SITE_ID for Argentina is MLA
    query = f"{make} {model} {year}" if year else f"{make} {model}"
    url = f"https://api.mercadolibre.com/sites/MLA/search?q={query}&category=MLA1743" # MLA1743 is Cars, Motorcycles & Others
    
    try:
        response = requests.get(url)
        data = response.json()
        
        results = data.get('results', [])
        
        # Filter by year if provided (API search is fuzzy)
        if year:
            results = [r for r in results if str(year) in r.get('title', '') or check_year_attribute(r, year)]
            
        if not results:
            return ({"error": "No vehicles found"}, 404, cors_headers)
            
        prices = [r.get('price') for r in results if r.get('currency_id') == 'ARS' and r.get('price')]
        
        if not prices:
             return ({"error": "No prices found in ARS"}, 404, cors_headers)

        # Calculate stats
        min_price = min(prices)
        max_price = max(prices)
        avg_price = statistics.mean(prices)
        median_price = statistics.median(prices)
        
        # Suggest trade-in price (e.g., 15% below average)
        suggested_trade_in = avg_price * 0.85
        
        return ({
            "query": query,
            "count": len(prices),
            "min_price": min_price,
            "max_price": max_price,
            "avg_price": avg_price,
            "median_price": median_price,
            "suggested_trade_in": suggested_trade_in,
            "currency": "ARS",
            "sample_links": [r.get('permalink') for r in results[:3]]
        }, 200, cors_headers)
        
    except Exception as e:
        return ({"error": str(e)}, 500, cors_headers)

def check_year_attribute(item, target_year):
    """Helper to check year in attributes"""
    for attr in item.get('attributes', []):
        if attr.get('id') == 'VEHICLE_YEAR' and str(target_year) in attr.get('value_name', ''):
            return True
    return False
