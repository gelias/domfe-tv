#!/bin/bash
cd "$(dirname "$0")" || exit 1

if command -v python3 >/dev/null 2>&1; then
  python3 iniciar_domfe_tv.py
elif command -v python >/dev/null 2>&1; then
  python iniciar_domfe_tv.py
else
  echo ""
  echo "Python 3 não foi encontrado neste Mac."
  echo "Instale o Python 3 para iniciar a Domfe TV."
  echo ""
  read -r -p "Pressione Enter para fechar..."
fi
