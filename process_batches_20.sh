#!/bin/bash

batch_num=20
batch_size=20

while true; do
  remaining=$(git ls-files --others --exclude-standard | wc -l)
  if [ $remaining -eq 0 ]; then
    echo "=== SVI FAJLOVI SU USPESNO PUSH-OVANI! ==="
    break
  fi

  echo ""
  echo "========================================="
  echo "Batch $batch_num - Preostalo: $remaining fajlova"
  echo "========================================="

  # Resetuj staging area
  git reset > /dev/null 2>&1

  # Dodaj fajlove pomocu wildcarda za foldere sa specijalnim karakterima
  git add "public/images/Galerija/2013/"*"Ba"*"koj"* 2>/dev/null || true
  git add "public/images/Galerija/2013/"*"devoj"* 2>/dev/null || true
  git add "public/images/Galerija/2014/"*"Baglja"* 2>/dev/null || true
  git add "public/images/Galerija/2014/"*"Luki"* 2>/dev/null || true
  git add "public/images/Galerija/"*"Ma"*"ar"* 2>/dev/null || true

  # Dodaj obicne fajlove (do batch_size)
  added=0
  git ls-files --others --exclude-standard | while IFS= read -r file && [ $added -lt $batch_size ]; do
    if git add "$file" 2>/dev/null; then
      added=$((added + 1))
    else
      # Ako direktno dodavanje ne uspe, probaj sa celim folderom
      dirname=$(dirname "$file")
      git add "$dirname"/* 2>/dev/null || true
    fi
  done

  # Proveri da li je nesto dodato
  staged=$(git diff --cached --name-only | wc -l)
  if [ $staged -eq 0 ]; then
    echo "Nema fajlova za commit, zavrsavam..."
    break
  fi

  echo "Dodato $staged fajlova u staging"
  echo "Pravim commit..."

  git commit -m "Add gallery images batch $batch_num" -q

  echo "Push-ujem batch $batch_num na GitHub..."
  echo "(Molim vas sacekajte, ovo moze da potraje...)"

  # Push sa timeout-om i provjerom uspjeha
  if git push origin master 2>&1; then
    echo "✓ Batch $batch_num uspesno push-ovan!"
  else
    echo "✗ GRESKA: Push nije uspeo za batch $batch_num"
    echo "Prekidam proces. Molim vas proverite konekciju i pokrenite ponovo."
    exit 1
  fi

  batch_num=$((batch_num + 1))

  # Mala pauza izmedju batch-eva
  sleep 3
done

echo ""
echo "========================================="
echo "GOTOVO! Svi fajlovi su na GitHub-u!"
echo "========================================="
