#!/bin/bash

batch_num=4
while true; do
  remaining=$(git ls-files --others --exclude-standard | wc -l)
  if [ $remaining -eq 0 ]; then
    echo "All files committed!"
    break
  fi

  echo "Processing batch $batch_num - $remaining files remaining"

  # Get files and add them one by one to handle special characters
  git ls-files --others --exclude-standard | head -50 > /tmp/batch_files.txt

  # Add files one by one
  while IFS= read -r file; do
    git add "$file" 2>/dev/null || echo "Failed to add: $file"
  done < /tmp/batch_files.txt

  # Check if anything was staged
  if git diff --cached --quiet; then
    echo "No files staged, stopping"
    break
  fi

  git commit -m "Add gallery images batch $batch_num"
  git push origin master
  echo "Batch $batch_num completed"

  batch_num=$((batch_num + 1))
done
