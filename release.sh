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

# Prompt for release type
echo -n "Select release type (patch|minor|major): "
read -r RELEASE_TYPE
case "$RELEASE_TYPE" in
  patch|minor|major)
    ;;
  *)
    echo "Invalid release type: $RELEASE_TYPE" >&2
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

# Install and publish
pnpm publish -r

echo "\n✅ Release $TAG completed successfully."
echo "🔗 https://github.com/inertiajs/inertia/releases/new?tag=$TAG"
