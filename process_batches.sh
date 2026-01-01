#!/bin/bash

for i in {3..21}; do
  remaining=$(git ls-files --others --exclude-standard | wc -l)
  if [ $remaining -eq 0 ]; then
    echo "All files committed!"
    break
  fi
  echo "Processing batch $i/21 - $remaining files remaining"
  git ls-files --others --exclude-standard | head -50 > /tmp/batch$i.txt
  cat /tmp/batch$i.txt | xargs -d '\n' git add
  git commit -m "Add gallery images batch $i/21"
  git push origin master
  echo "Batch $i completed"
done
