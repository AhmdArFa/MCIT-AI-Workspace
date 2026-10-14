"""MCIT document kit: design tokens, constant assets and the template index.

Everything Studio and Tut Agent generate is built from this kit:

* ``tokens``: the Midnight Noir palette (dark default, light on request),
  Nohemi headings, Libre Franklin body, Inter on covers.
* ``assets``: constant cover art, fonts, Open Doodles artwork and the
  approved template files, with a readiness check the admin console shows.
* ``templates``: the master template index (which template and engine each
  of the four Studio features uses).
* ``skills/``: the document skills, served to Tut Agent over MCP.
"""

from open_notebook.craft.kit.assets import ASSETS_DIR, readiness
from open_notebook.craft.kit.tokens import FONTS, Mode, Theme, theme

__all__ = ["ASSETS_DIR", "FONTS", "Mode", "Theme", "readiness", "theme"]
