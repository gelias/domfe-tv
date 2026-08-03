#!/usr/bin/env python3
"""Servidor HTTP local e multiplataforma da Domfe TV."""
from __future__ import annotations

import contextlib
import http.server
import json
import os
import re
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path

HOST = "127.0.0.1"
START_PORT = 8765
AGENDA_DIRECTORY = Path("content/agenda")
AGENDA_FILE_PATTERN = re.compile(r"^(mes|semana([1-9][0-9]*))\.png$", re.IGNORECASE)


def agenda_files(directory: Path = AGENDA_DIRECTORY) -> list[str]:
    """Lista os cards mensais, sempre com mes.png antes das semanas."""
    if not directory.is_dir():
        return []

    matches = []
    for path in directory.iterdir():
        match = AGENDA_FILE_PATTERN.fullmatch(path.name)
        if path.is_file() and match:
            order = 0 if match.group(1).lower() == "mes" else int(match.group(2))
            matches.append((order, path.name))
    return [f"content/agenda/{name}" for _, name in sorted(matches, key=lambda item: (item[0], item[1].lower()))]


def available_port(start: int = START_PORT) -> int:
    for port in range(start, start + 30):
        with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("Não foi possível encontrar uma porta local disponível.")


class DomfeHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/api/agenda":
            payload = json.dumps({"files": agenda_files()}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def copyfile(self, source, outputfile) -> None:
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            # O navegador pode cancelar uma leitura de mídia ao trocar de cena.
            pass


def main() -> int:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)
    port = available_port()
    url = f"http://{HOST}:{port}/"

    class ReusableTCPServer(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with ReusableTCPServer((HOST, port), DomfeHandler) as server:
        print("\nDOMFE TV iniciada.")
        print(f"Endereço: {url}")
        print("Mantenha esta janela aberta durante a programação.")
        print("Para encerrar, pressione Ctrl+C.\n")
        if os.environ.get("DOMFE_NO_BROWSER") != "1":
            threading.Thread(target=lambda: (time.sleep(0.8), webbrowser.open(url)), daemon=True).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nDomfe TV encerrada.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Erro ao iniciar a Domfe TV: {exc}")
        if sys.stdin.isatty():
            input("Pressione Enter para fechar...")
        raise SystemExit(1)
