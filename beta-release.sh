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

# Read version from first package (root package.json has no version)
CURRENT_VERSION=$(node -p "require('./packages/core/package.json').version")

echo
echo "Current version: $CURRENT_VERSION"
echo

# Compute next beta version
NEW_VERSION=$(node -e "
  const v = '$CURRENT_VERSION'
  const match = v.match(/^(.+)-beta\.(\d+)$/)
  if (match) {
    console.log(match[1] + '-beta.' + (parseInt(match[2]) + 1))
  } else {
    const [major, minor, patch] = v.split('.').map(Number)
    console.log((major + 1) + '.0.0-beta.1')
  }
")

echo "New version: $NEW_VERSION"
echo

# Set version in each package without creating git tags
for pkg_json in packages/*/package.json; do
  pkg_dir=$(dirname "$pkg_json")
  echo "Bumping $pkg_dir..."
  cd "$pkg_dir"
  pnpm version "$NEW_VERSION" --no-git-tag-version > /dev/null
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
