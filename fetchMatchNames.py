from time import sleep
import dotenv
import requests
import json

key = dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]

name = "bigleagueplayer#NA1"

tags = name.split("#")

r = requests.get(f'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{tags[0]}/{tags[1]}?api_key={key}')

puuid = r.json()["puuid"]
print(puuid)


def getMatchIds(puuid):
    start_index = 0
    all_matches = []

    while True:
        r = requests.get(f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime=1672531200&endTime=1734977661&queue=400&start={start_index}&count=100&api_key={key}")

        # If the responce is ok, add to list
        if (r.status_code == 200):
            json_list = r.json()

            if not json_list:
                # The list is empty -> We have found all matches
                break

            # print(json_list)
            all_matches.extend(json_list)

        elif (r.status_code == 429):
            print("Too many requests")
            sleep(100)
            
        # Update for next batch
        start_index += 100

    # Open the file in write mode and save the list as JSON
    with open(tags[0] + "_matches.json", 'w') as file:
        json.dump(all_matches, file)



def getMatchInfo():

    all_matches = []

    with open(tags[0] + "_matches.json", 'r') as file:
        match_ids = json.load(file)

        num_matches = len(match_ids)
        cur_match = 0

        while cur_match < num_matches:
            print(match_ids[cur_match])

            r = requests.get(f'https://americas.api.riotgames.com/lol/match/v5/matches/{match_ids[cur_match]}?api_key={dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]}')

            # If the response is ok, add to list
            if (r.status_code == 200):
                json_list = r.json()


                # print(json_list)
                all_matches.append(json_list)
                # print(all_matches)
                cur_match += 1

                # Open the file in write mode and save the list as JSON
                with open(tags[0] + "_match_data.json", 'w') as file:
                    json.dump(all_matches, file)


            elif (r.status_code == 429):
                print("Too many requests")
                sleep(20)
                

        



getMatchInfo()