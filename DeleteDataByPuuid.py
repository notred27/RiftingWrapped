import requests

puuid = "XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw"
response = requests.delete(
    'http://localhost:5000/delete_by_puuid',
    params={'puuid': puuid}
)

print(response.status_code)
print(response.json())
