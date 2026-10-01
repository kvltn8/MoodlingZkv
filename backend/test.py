import requests
from requests.auth import HTTPBasicAuth



AUTH_BASE_BY_ENV = {
    "prelive": "https://prelive-oauth2.quran.foundation",
    "production": "https://oauth2.quran.foundation",
}


def get_access_token():
    env = "production"
    if env not in AUTH_BASE_BY_ENV:
        raise ValueError(
            f"Invalid QF_ENV value: {env!r}. Expected 'prelive' or 'production'."
        )

    AUTH_BASE_URL = AUTH_BASE_BY_ENV[env]

    response = requests.post(
        f"{AUTH_BASE_URL}/oauth2/token",
        auth=HTTPBasicAuth(
            '05202cd3-745a-49d5-b765-e2468879b842',
            'qfcs_9dd808a8ff3b4d068e0f3862f258bfaf43a078952abf41f9a991ed21ce9806af',
        ),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "client_credentials",
            "scope": "content",
        },
        timeout=30,
    )
    
    response.raise_for_status()

    token = response.json()
    access_token = token["access_token"]
    expires_in = token["expires_in"]
    return access_token
results = print(get_access_token())
print(results)
