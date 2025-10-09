#!/usr/bin/env bash
set -euo pipefail

# Ensure we are on master and the working tree is clean
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "master" ]; then
  echo "Error: must be on master branch (current: $CURRENT_BRANCH)" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree is not clean. Commit or stash changes before releasing." >&2
  git status --porcelain
  exit 1
fi

echo
echo "Current version: $(node -p "require('./package.json').version")"
echo

echo "Select version bump type:"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Bump version in each package without creating git tags
NEW_VERSION=""
for pkg_json in packages/*/package.json; do
  pkg_dir=$(dirname "$pkg_json")
  echo "Bumping $pkg_dir to $RELEASE_TYPE..."
  cd "$pkg_dir"
  echo "Current directory: $(pwd)"
  OUT=$(pnpm version "$RELEASE_TYPE" --no-git-tag-version)
  if [ -z "$NEW_VERSION" ]; then
    # Capture the first reported version; strip leading 'v' if present
    OUT_LAST=$(echo "$OUT" | tail -n1 | tr -d '\r')
    NEW_VERSION=${OUT_LAST#v}
  fi
  cd ..
  cd ..
done

TAG="v$NEW_VERSION"
echo "New version resolved as $TAG"

pnpm install

# Commit changes and create tag
git add .
git commit -m "$TAG"
git tag -a "$TAG" -m "$TAG"
git push
git push --tags

gh release create "$TAG" --generate-notes

echo ""
echo "✅ Release $TAG completed successfully, publishing kicked off in CI."
echo "🔗 https://github.com/inertiajs/inertia/releases/tag/$TAG"
