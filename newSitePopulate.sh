#!/bin/bash

# Usage: ./newAISite.sh <siteName>


# You can add logic using these parameters
# Check if a parameter is provided
if [ -z "$1" ]; then
  echo "Usage: ./start_site.sh <site_name>"
  exit 1
fi

# Assign the first parameter to a variable
site_name=$1

# Run the command with the provided site name
cd "$site_name" && cp ../parsePages.js parsePages.js && node parsePages.js


