import os
import time
import requests
from dotenv import load_dotenv


load_dotenv()

# Environment variables
BASE_URL = "https://api.binance.com"
API_KEY = os.getenv("API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
AUTH_SECRET = os.getenv("AUTH_SECRET")
PAY_ID = os.getenv("PAY_ID")

def create_signature(query_string: str, secret_key: str) -> str:
    import hmac
    import hashlib
    return hmac.new(secret_key.encode(), query_string.encode(), hashlib.sha256).hexdigest()


def make_authorized_binance_request(endpoint: str, method: str = 'POST', params: dict = None, body: dict = None, custom_headers: dict = None, max_retries: int = 3) -> dict:
    url = f'{BASE_URL}{endpoint}'
    
    headers = {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
    }

    if custom_headers:
        headers.update(custom_headers)

    if params is None:
        params = {}

    # Add recvWindow parameter to give more time for request
    params['recvWindow'] = 5000


    for attempt in range(max_retries):
        try:
            # Update timestamp for each attempt
            timestamp = int(time.time() * 1000)
            params['timestamp'] = timestamp
            query_string = '&'.join([f"{key}={value}" for key, value in params.items()])
            signature = create_signature(query_string, SECRET_KEY)
            params['signature'] = signature

                
            if method == 'POST':
                response = requests.post(url, headers=headers, json=body, params=params)
            else:
                response = requests.get(url, headers=headers, params=params)
            
            response.raise_for_status()
            
            # Handle empty response
            if not response.text:
                return {"success": True}
                
            return response.json()
            
        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                error_code = None
                try:
                    error_response = e.response.json()
                    error_code = error_response.get('code')
                except:
                    pass

                # If it's a timestamp error (-1021), retry
                if error_code == -1021 and attempt < max_retries - 1:
                    print(f"Timestamp error occurred, retrying... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(1)  # Add small delay before retry
                    continue
                    
                print(f"Request failed with status code {e.response.status_code}")
                print(f"Error response: {e.response.text}")
            else:
                print(f"Request failed: {str(e)}")
            return None
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return None
            
    return None  # Return None if all retries failed



def get_pay_id(adv_no):
    endpoint = "/sapi/v1/c2c/ads/getDetailByNo"
    resp = make_authorized_binance_request(
        endpoint,
        method="POST",
        params={
            "adsNo": adv_no
        }
    )
    return resp


def create_new_ad():
    endpoint = "/sapi/v1/c2c/ads/post"
    body = {
        "asset": "USDT",
        "buyerKycLimit": 1,
        "fiatUnit": "ZAR",

        "initAmount": 100,
        "minSingleTransAmount": 1000,   # ≤ 11 400
        "maxSingleTransAmount": 20000,  # ≤ 11 400

        "price": 25.00,
        "priceType": 1,                 # 1 = FIXED
        "tradeType": "SELL",
        "classify": "profession",
        "onlineNow": False,
        "tradeMethods": [
            {
                "identifier": "BankTransfer",
                "payId": PAY_ID,
                "payType": "BANK_TRANSFER"
            }
        ],
        "takerAdditionalKycRequired": 0,
        "userAllTradeCountMin": 100000,
        "userTradeCountFilterTime": 2
    }


    resp = make_authorized_binance_request(
        endpoint,
        method="POST",
        body=body,
       
    )

    print("Ad created!" if resp else "Creation failed:", resp)

if __name__ == "__main__":
    #data = get_pay_id(13753690538259550208)
    create_new_ad()
    
    #print(data)







