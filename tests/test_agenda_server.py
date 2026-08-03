import tempfile
import unittest
from pathlib import Path

from iniciar_domfe_tv import agenda_files


class AgendaFilesTest(unittest.TestCase):
    def test_month_is_first_and_only_supported_files_are_listed(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            directory = Path(temp_dir)
            for name in ("semana5.png", "semana2.png", "mes.png", "julho-01.png", "notas.txt"):
                (directory / name).touch()

            self.assertEqual(agenda_files(directory), [
                "content/agenda/mes.png",
                "content/agenda/semana2.png",
                "content/agenda/semana5.png",
            ])

    def test_missing_directory_has_no_cards(self):
        self.assertEqual(agenda_files(Path("diretorio-inexistente")), [])


if __name__ == "__main__":
    unittest.main()
