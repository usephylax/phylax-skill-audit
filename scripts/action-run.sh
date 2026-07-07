#!/usr/bin/env bash
# GitHub Action entrypoint — run phylax-skill-audit and map exit codes to fail-on policy.
set -euo pipefail

SKILL="${INPUT_SKILL:?skill input is required}"
MODE="${INPUT_MODE:-fast}"
FAIL_ON="${INPUT_FAIL_ON:-deny}"
VERSION="${INPUT_VERSION:-0.2.3}"

ARGS=(--skill "$SKILL" --mode "$MODE" --chain "${INPUT_CHAIN_ID:-8453}")

if [ -n "${INPUT_MANIFEST:-}" ]; then
  ARGS+=(--manifest "$INPUT_MANIFEST")
fi
if [ -n "${INPUT_CONTRACTS:-}" ]; then
  ARGS+=(--contracts "$INPUT_CONTRACTS")
fi
if [ -n "${INPUT_ENDPOINTS:-}" ]; then
  ARGS+=(--endpoints "$INPUT_ENDPOINTS")
fi

OUT="$(mktemp)"
RUN_DIR="${RUNNER_TEMP:-/tmp}/phylax-action-$$"
mkdir -p "$RUN_DIR"
npm install --no-save --prefix "$RUN_DIR" "phylax-skill-audit@${VERSION}" >/dev/null 2>&1

set +e
node "$RUN_DIR/node_modules/phylax-skill-audit/dist/cli.js" "${ARGS[@]}" >"$OUT" 2>&1
EXIT=$?
set -e
rm -rf "$RUN_DIR"

cat "$OUT"

VERDICT="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log(j.verdict||'UNKNOWN')" "$OUT" 2>/dev/null || echo UNKNOWN)"
SCORE="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log(j.score??'')" "$OUT" 2>/dev/null || echo "")"
SUMMARY="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log(j.summary||'')" "$OUT" 2>/dev/null || echo "")"

{
  echo "verdict=$VERDICT"
  echo "score=$SCORE"
  echo "summary<<EOF"
  echo "$SUMMARY"
  echo "EOF"
} >>"${GITHUB_OUTPUT:?GITHUB_OUTPUT not set}"

rm -f "$OUT"

# phylax CLI: 0=ALLOW 1=WARN 2=DENY 3+=fatal
if [ "$EXIT" -ge 3 ]; then
  echo "::error::Phylax audit failed (exit $EXIT)"
  exit "$EXIT"
fi

case "$FAIL_ON" in
  none) exit 0 ;;
  warn)
    if [ "$EXIT" -ge 1 ]; then
      echo "::error::Phylax verdict: $VERDICT (score ${SCORE:-?}) — fail-on=warn"
      exit "$EXIT"
    fi
    ;;
  deny|*)
    if [ "$EXIT" -ge 2 ]; then
      echo "::error::Phylax verdict: DENY (score ${SCORE:-?})"
      exit 2
    fi
    if [ "$EXIT" -eq 1 ]; then
      echo "::warning::Phylax verdict: WARN (score ${SCORE:-?})"
    fi
    ;;
esac

exit 0
