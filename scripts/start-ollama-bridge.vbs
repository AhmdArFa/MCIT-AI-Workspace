Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & Replace(WScript.ScriptFullName, "start-ollama-bridge.vbs", "ollama-bridge.js") & """", 0, False
