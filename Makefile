# SomethingOS — Debian Bookworm remix
#   make iso              # GNOME Shadow (default)
#   make iso DESKTOP=plasma
#   make iso DESKTOP=gnome
#   make preview          # product site + live session

SHELL := /bin/bash
.DEFAULT_GOAL := help

VERSION   := $(shell cat VERSION)
CODENAME  := shadow
DESKTOP   ?= gnome
ARCH      ?= amd64
JOBS      ?= $(shell nproc)
ISO_NAME  := somethingos-$(VERSION)-$(CODENAME)-$(DESKTOP)-$(ARCH).iso
ROOT      := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: help info prepare config iso iso-container core desktop plasma preview clean distclean check

help:
	@printf '%s\n' \
	  'SomethingOS $(VERSION) "$(CODENAME)"' \
	  '' \
	  '  make iso                 Build the GNOME Shadow live ISO (Debian host)' \
	  '  make iso DESKTOP=plasma  Build the Plasma Shadow live ISO' \
	  '  make iso-container       Same ISO, inside debian:bookworm (Fedora/podman)' \
	  '  make prepare             Stage branding into live-build tree' \
	  '  make config              Configure live-build (no build)' \
	  '  make preview             Serve the product site on :8080' \
	  '  make check               Lint scripts and required files' \
	  '  make clean               Remove ISO artefacts, keep cache' \
	  '  make distclean           Remove cache and chroot as well'

info:
	@printf '%s\n' \
	  "version  $(VERSION)" \
	  "codename $(CODENAME)" \
	  "desktop  $(DESKTOP)" \
	  "arch     $(ARCH)" \
	  "iso      $(ISO_NAME)"

prepare:
	@bash "$(ROOT)/scripts/stage-branding.sh"

config: prepare
	@DESKTOP="$(DESKTOP)" ARCH="$(ARCH)" VERSION="$(VERSION)" CODENAME="$(CODENAME)" \
	  bash "$(ROOT)/auto/config"

iso: prepare
	@test "$(DESKTOP)" = "gnome" -o "$(DESKTOP)" = "plasma" || { echo "DESKTOP must be gnome or plasma"; exit 2; }
	@echo "==> building SomethingOS $(VERSION) $(CODENAME) ($(DESKTOP)/$(ARCH))"
	@DESKTOP="$(DESKTOP)" ARCH="$(ARCH)" VERSION="$(VERSION)" CODENAME="$(CODENAME)" ISO_NAME="$(ISO_NAME)" \
	  bash "$(ROOT)/scripts/build.sh"

core:
	@$(MAKE) iso DESKTOP=gnome

desktop: core

plasma:
	@$(MAKE) iso DESKTOP=plasma

# Fedora (and everyone else): do not install live-build on the host.
# Needs podman or docker, and a privileged container so debootstrap can chroot.
iso-container: prepare
	@test "$(DESKTOP)" = "gnome" -o "$(DESKTOP)" = "plasma" || { echo "DESKTOP must be gnome or plasma"; exit 2; }
	@engine=""; \
	  if command -v podman >/dev/null 2>&1; then engine=podman; \
	  elif command -v docker >/dev/null 2>&1; then engine=docker; \
	  else \
	    echo "iso-container: need podman or docker."; \
	    echo "On Fedora you probably want: sudo dnf install podman"; \
	    echo "Or skip local builds — GitHub Actions → SomethingOS ISO."; \
	    exit 1; \
	  fi; \
	  echo "==> $$engine  debian:bookworm  DESKTOP=$(DESKTOP)"; \
	  $$engine run --rm --privileged \
	    -e DESKTOP="$(DESKTOP)" \
	    -e CI=true \
	    -e APT_INDICES=false \
	    -e DEBIAN_FRONTEND=noninteractive \
	    -v "$(ROOT)":/build:Z \
	    -w /build \
	    debian:bookworm \
	    bash /build/scripts/ci-debian.sh

preview:
	@echo "SomethingOS preview → http://0.0.0.0:8080"
	@cd "$(ROOT)/website" && python3 -m http.server 8080 --bind 0.0.0.0

check:
	@bash "$(ROOT)/scripts/check.sh"

clean:
	@if command -v lb >/dev/null 2>&1; then sudo lb clean --all || true; fi
	@rm -f live-image-*.iso live-image-*.img live-image-*.contents live-image-*.packages live-image-*.files live-image-*.log
	@rm -f somethingos-*.iso build.log
	@echo "cleaned build artefacts"

distclean: clean
	@if command -v lb >/dev/null 2>&1; then sudo lb clean --purge || true; fi
	@rm -rf cache chroot .build binary
	@echo "purged live-build cache"
