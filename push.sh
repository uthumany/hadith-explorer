#!/bin/bash
cd /workspace/hadith-explorer
rm -rf .git
git init -b main
git config user.email "user@example.com"
git config user.name "uthumany"
echo -e "node_modules/\ndist/" > .gitignore
git add -A
git commit -m "Initial commit: Al-Bayan Hadith Explorer"
