#!/bin/bash

# 🔍 agents-skills Code Review Script
# Helps you review your changes before committing.

echo "🔍 Starting code review on staged changes..."

STAGED_FILES=$(git diff --staged --name-only)

if [ -z "$STAGED_FILES" ]; then
  echo "⚠️ No files staged for commit. Stage some files first with 'git add'."
  exit 0
fi

echo "The following files will be reviewed:"
echo "$STAGED_FILES"
echo "----------------------------------------"

for file in $STAGED_FILES; do
  echo "👀 Reviewing $file..."
  
  # Check for TODOs or FIXMEs
  if grep -nE "TODO|FIXME" "$file" > /dev/null; then
    echo "   📍 Found TODO/FIXME in $file"
    grep -nE "TODO|FIXME" "$file"
  fi

  # Check for console.logs in source files
  if [[ "$file" == src/* ]] && grep -n "console.log" "$file" > /dev/null; then
    echo "   📢 Found console.log in source file $file"
  fi
done

echo "----------------------------------------"
echo "✅ Local code review complete! You're ready to commit."
