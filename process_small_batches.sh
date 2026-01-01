#!/bin/bash

batch_num=20
batch_size=20

while true; do
  remaining=$(git ls-files --others --exclude-standard | wc -l)
  if [ $remaining -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "=== SVI FAJLOVI SU PUSH-OVANI! ==="
    echo "========================================="
    break
  fi

  echo ""
  echo "========================================="
  echo "Batch $batch_num - Preostalo: $remaining fajlova"
  echo "========================================="

  # Uzmi prvih 20 fajlova
  files=$(git ls-files --others --exclude-standard | head -$batch_size)

  # Dodaj ih jedan po jedan
  count=0
  echo "$files" | while IFS= read -r file; do
    if [ -n "$file" ]; then
      if git add "$file" 2>/dev/null; then
        count=$((count + 1))
      else
        # Ako ne uspe, probaj sa folderom
        dirname=$(dirname "$file")
        git add "$dirname"/* 2>/dev/null || true
      fi
    fi
  done

  # Proveri koliko je fajlova dodato
  staged=$(git diff --cached --name-only | wc -l)
  if [ $staged -eq 0 ]; then
    echo "Nema fajlova za commit, zavrsavam..."
    break
  fi

  echo "Dodato $staged fajlova u staging"
  echo "Pravim commit..."

  git commit -m "Add gallery images batch $batch_num" -q

  echo "Push-ujem batch $batch_num na GitHub..."

  # Push i provera uspеha
  if git push origin master; then
    echo "✓ Batch $batch_num uspesno push-ovan!"
  else
    echo "✗ GRESKA: Push nije uspeo!"
    echo "Prekidam..."
    exit 1
  fi

  batch_num=$((batch_num + 1))
  sleep 2
done
