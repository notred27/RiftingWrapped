#!/bin/bash

DISPLAY_NAME="MrWarwickWide"
TAG="2725"
curl -X POST "http://localhost:5000/add_user?displayName=${DISPLAY_NAME}&tag=${TAG}"
