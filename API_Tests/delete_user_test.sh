#!/bin/bash

USER_PUUID="aaa"
curl -X POST "http://localhost:5000/add_user?puuid=${USER_PUUID}"
