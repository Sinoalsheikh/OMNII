#!/bin/bash

# Ensure we're in the correct directory
cd /home/user/OmniFlow-Ai

# Add all changes
git add .

# Commit changes
git commit -m "Update OmniFlow.Ai project"

# Push to GitHub
git push -u origin main

echo "Changes pushed to GitHub successfully!"
