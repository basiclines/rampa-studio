#!/bin/bash

# Check if branch name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

BRANCH=$1

# Fetch the latest commits
git fetch

# Get the list of commits in the specified branch
commits=$(git rev-list --reverse $BRANCH)

# Loop through each commit
for commit in $commits; do
  # Checkout to the commit
  git checkout $commit
  
  # Wait for 500 milliseconds
  sleep 0.5
done

# Optionally, checkout back to the original branch
git checkout $BRANCH
