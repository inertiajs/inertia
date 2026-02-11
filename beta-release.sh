#!/usr/bin/env bash
set -euo pipefail

# Ensure we are on 3.x and the working tree is clean
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "3.x" ]; then
  echo "Error: must be on 3.x branch (current: $CURRENT_BRANCH)" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree is not clean. Commit or stash changes before releasing." >&2
  git status --porcelain
  exit 1
fi

CURRENT_VERSION=$(node -p "require('./package.json').version")

echo
echo "Current version: $CURRENT_VERSION"
echo

# Determine version command: first beta needs an explicit version,
# subsequent betas can use prerelease bump
if [[ "$CURRENT_VERSION" == *"-beta."* ]]; then
  VERSION_CMD="prerelease --preid beta"
else
  VERSION_CMD="3.0.0-beta.1"
fi

# Bump version in each package without creating git tags
NEW_VERSION=""
for pkg_json in packages/*/package.json; do
  pkg_dir=$(dirname "$pkg_json")
  echo "Bumping $pkg_dir..."
  cd "$pkg_dir"
  OUT=$(pnpm version $VERSION_CMD --no-git-tag-version)
  if [ -z "$NEW_VERSION" ]; then
    # Capture the first reported version; strip leading 'v' if present
    OUT_LAST=$(echo "$OUT" | tail -n1 | tr -d '\r')
    NEW_VERSION=${OUT_LAST#v}
  fi
  cd ../..
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

gh release create "$TAG" --generate-notes --prerelease

echo ""
echo "Release $TAG completed successfully, publishing kicked off in CI."
echo "https://github.com/inertiajs/inertia/releases/tag/$TAG"
