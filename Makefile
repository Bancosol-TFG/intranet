PYTHON ?= python3
MAKEFILE_ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
VENV ?= $(MAKEFILE_ROOT).venv-docs
VENV_BIN := $(VENV)/bin
PIP := $(VENV_BIN)/python -m pip
ZENSICAL := $(VENV_BIN)/python -m zensical
DOCS_CONFIG := $(MAKEFILE_ROOT)zensical.toml
DOCS_REQUIREMENTS := $(MAKEFILE_ROOT)requirements-docs.txt
DOCS_STAMP := $(VENV)/.docs-installed

.PHONY: help venv docs-install docs-serve docs-build docs-clean

help:
	@echo "Comandos disponibles:"
	@echo "  make docs-serve   Sirve la documentación con recarga automática"
	@echo "  make docs-build   Genera y valida la documentación en build/docs/"
	@echo "  make docs-clean   Elimina la documentación generada"
	@echo "  make venv         Crea el entorno e instala sus dependencias"

venv: $(DOCS_STAMP)

docs-install: venv

$(VENV_BIN)/python:
	$(PYTHON) -m venv $(VENV)

$(DOCS_STAMP): $(DOCS_REQUIREMENTS) | $(VENV_BIN)/python
	$(PIP) install --upgrade pip
	$(PIP) install -r $(DOCS_REQUIREMENTS)
	@touch $(DOCS_STAMP)

docs-serve: venv
	$(ZENSICAL) serve --config-file $(DOCS_CONFIG)

docs-build: venv
	$(ZENSICAL) build --config-file $(DOCS_CONFIG) --clean

docs-clean:
	rm -rf $(MAKEFILE_ROOT)build/docs
