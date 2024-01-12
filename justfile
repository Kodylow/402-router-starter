run:
    bun run server.ts

cln-start:
    lightningd --lightning-dir=.lightning --log-file=lightningd.log --daemon

alias:
    alias lc="lightning-cli --lightning-dir=.lightning"

cln-stop:
    lightning-cli --lightning-dir=.lightning stop
