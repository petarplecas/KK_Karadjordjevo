#!/bin/bash

batch_num=20
batch_size=30

while true; do
  remaining=$(git ls-files --others --exclude-standard | wc -l)
  if [ $remaining -eq 0 ]; then
    echo "Svi fajlovi su commit-ovani!"
    break
  fi

  echo "Obradjujem batch $batch_num - preostalo $remaining fajlova"

  # Dodaj fajlove pomocu wildcarda za foldere sa specijalnim karakterima
  git add "public/images/Galerija/2013/"*"Ba"*"koj"* 2>/dev/null || true
  git add "public/images/Galerija/2013/"*"devoj"* 2>/dev/null || true
  git add "public/images/Galerija/2014/"*"Baglja"* 2>/dev/null || true

  # Dodaj obicne fajlove
  count=0
  git ls-files --others --exclude-standard | head -$batch_size | while IFS= read -r file; do
    # Probaj da dodas fajl direktno
    if git add "$file" 2>/dev/null; then
      count=$((count + 1))
    else
      # Ako ne uspe, probaj sa wildcard
      dirname=$(dirname "$file")
      git add "$dirname"/* 2>/dev/null || true
    fi
  done

  # Proveri da li je nesto dodato
  if git diff --cached --quiet; then
    echo "Nema fajlova za commit, zavrsetk"
    break
  fi

  # Prebroj staging fajlove
  staged=$(git diff --cached --name-only | wc -l)
  echo "Dodato $staged fajlova u batch $batch_num"

  git commit -m "Add gallery images batch $batch_num"
  git push origin master
  echo "Batch $batch_num zavrsen"

  batch_num=$((batch_num + 1))

  # Pauza izmedju push-eva
  sleep 2
done

echo "Gotovo! Svi fajlovi su uspesno push-ovani."
