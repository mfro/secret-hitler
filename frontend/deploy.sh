if [ ! -d "gh-pages" ]; then
  git clone --branch "gh-pages" $(git remote get-url origin) "gh-pages"
fi

yarn build

rm -r "gh-pages"/*
cp -r "dist"/* "gh-pages"

cd "gh-pages"
git add .
git commit -m "gh-pages"
git push
