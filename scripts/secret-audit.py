#!/usr/bin/env python3
"""Report likely secret locations without printing secret values."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUSPICIOUS = re.compile(
    r"(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|"
    r"(?:postgres|postgresql)://[^\s'\"]+@|"
    r"(?i:(?:api[_-]?key|secret|token|password|database[_-]?url|authorization))\s*[:=]\s*['\"][^'\"]{8,})"
)
PLACEHOLDERS = ("ep-example", "user:password", "your_", "placeholder", "example", "process.env", "__encrypted__")


def run(*args: str) -> str:
    return subprocess.run(args, cwd=ROOT, check=True, capture_output=True, text=True).stdout


def is_placeholder(match: str) -> bool:
    lowered = match.lower()
    return any(marker in lowered for marker in PLACEHOLDERS)


def findings_for_text(text: str) -> int:
    return sum(1 for match in SUSPICIOUS.finditer(text) if not is_placeholder(match.group(0)))


def file_findings() -> dict[str, int]:
    findings: dict[str, int] = {}
    files = run("git", "ls-files", "-co", "--exclude-standard", "-z").split("\0")
    for relative in filter(None, files):
        path = ROOT / relative
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        count = findings_for_text(content)
        if count:
            findings[relative] = count
    return findings


def history_findings() -> dict[str, list[str]]:
    history: dict[str, list[str]] = {}
    commits = run("git", "rev-list", "--all").splitlines()
    for commit in commits:
        matched: list[str] = []
        files = run("git", "ls-tree", "-r", "--name-only", commit).splitlines()
        for relative in files:
            result = subprocess.run(
                ["git", "show", f"{commit}:{relative}"], cwd=ROOT, capture_output=True, text=True, errors="ignore"
            )
            if result.returncode == 0 and findings_for_text(result.stdout):
                matched.append(relative)
        if matched:
            history[commit] = matched
    return history


report = {
    "working_tree": file_findings(),
    "reachable_history": history_findings(),
    "note": "Values are intentionally redacted; investigate only the listed paths or commits if findings are non-empty.",
}
print(json.dumps(report, indent=2, sort_keys=True))
