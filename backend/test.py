import requests
from requests.auth import HTTPBasicAuth



AUTH_BASE_BY_ENV = {
    "prelive": "https://prelive-oauth2.quran.foundation",
    "production": "https://oauth2.quran.foundation",
}


def get_access_token():
    env = "prelive"
    if env not in AUTH_BASE_BY_ENV:
        raise ValueError(
            f"Invalid QF_ENV value: {env!r}. Expected 'prelive' or 'production'."
        )

    AUTH_BASE_URL = AUTH_BASE_BY_ENV[env]

    response = requests.post(
        f"{AUTH_BASE_URL}/oauth2/token",
        auth=HTTPBasicAuth(
            '300ea3c2-f4b4-4cc1-8417-0108b39c4dd0',
            'qfcs_9c6a261443d04761bb96020b9a49d347c4f55af049234ae086b187d808a6235a',
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
