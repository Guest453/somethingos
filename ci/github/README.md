# GitHub Actions

Canonical workflow files. GitHub only executes what sits in
`.github/workflows/` on the repo.

```
mkdir -p .github/workflows
cp ci/github/iso.yml   .github/workflows/iso.yml
cp ci/github/check.yml .github/workflows/check.yml
git add .github/workflows && git commit -m "Enable Actions" && git push
```

`iso.yml` is the one you want on Fedora: **Actions → SomethingOS ISO →
Run workflow**. It builds the Debian live image in `debian:bookworm`
and uploads `somethingos-*.iso`.
