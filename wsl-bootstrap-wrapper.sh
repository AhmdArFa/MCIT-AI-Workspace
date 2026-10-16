#!/bin/sh
LOG="/var/log/wsl-bootstrap-wrapper.log"
mkdir -p /var/log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] RAW ARGS: $@" >> "$LOG"

normalize() {
    p="$1"
    # Convert any backslashes to slashes
    p=$(printf '%s\n' "$p" | tr '\\' '/')

    # Handle C:/... or c:/... -> /c/...
    case "$p" in
        [a-zA-Z]:/*)
            drive=$(printf '%s' "$p" | cut -c 1 | tr '[:upper:]' '[:lower:]')
            rest=$(printf '%s' "$p" | cut -c 3-)
            p="/$drive$rest"
            ;;
        [a-zA-Z]/*)
            drive=$(printf '%s' "$p" | cut -c 1 | tr '[:upper:]' '[:lower:]')
            rest=$(printf '%s' "$p" | cut -c 2-)
            p="/$drive$rest"
            ;;
    esac
    printf '%s' "$p"
}

TOTAL=$#
i=0
while [ "$i" -lt "$TOTAL" ]; do
    arg="$1"
    shift
    i=$((i + 1))
    case "$arg" in
        --base-image|--cli-iso)
            FLAG="$arg"
            if [ "$i" -lt "$TOTAL" ]; then
                VAL="$1"
                shift
                i=$((i + 1))
                VAL=$(normalize "$VAL")
                set -- "$@" "$FLAG" "$VAL"
            else
                set -- "$@" "$FLAG"
            fi
            ;;
        *)
            set -- "$@" "$arg"
            ;;
    esac
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] EXEC: /usr/local/bin/wsl-bootstrap.real $@" >> "$LOG"
exec /usr/local/bin/wsl-bootstrap.real "$@"
