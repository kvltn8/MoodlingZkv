import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings
import json



AUTH_BASE_BY_ENV = {
    "prelive": "https://prelive-oauth2.quran.foundation",
    "production": "https://oauth2.quran.foundation",
}

API_BASE_BY_ENV = {
    "prelive": "https://apis-prelive.quran.foundation/content/api/v4", 
    "production": "https://apis.quran.foundation/content/api/v4",                                                           
}

def get_access_token():
    env = settings.QF_ENV
    if env not in AUTH_BASE_BY_ENV:
        raise ValueError(
            f"Invalid QF_ENV value: {env!r}. Expected 'prelive' or 'production'."
        )

    AUTH_BASE_URL = AUTH_BASE_BY_ENV[env]

    response = requests.post(
        f"{AUTH_BASE_URL}/oauth2/token",
        auth=HTTPBasicAuth(
            settings.CLIENT_ID,
            settings.CLIENT_SECRET,
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

    return access_token

def get_surah_audio(surah_number, reciter_id):
    env = settings.QF_ENV 


    api_base = API_BASE_BY_ENV[env]

    access_token = get_access_token()

    url = (
        f"{api_base}/chapter_recitations/"
        f"{reciter_id}/{surah_number}"
    )

    headers = {
        "x-auth-token": access_token,
        "x-client-id": settings.CLIENT_ID,
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30,
    )

    if response.status_code == 401:

        access_token = get_access_token()

        headers["x-auth-token"] = access_token

        response = requests.get(
            url,
            headers=headers,
            timeout=30,
        )

    response.raise_for_status()

    data = response.json()

    return data["audio_file"]["audio_url"]
