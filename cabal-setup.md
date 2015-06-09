# cabal-setup.md

In order to configure cabal and initialize a sandbox, make sure you have
the Haskell tool-chain, you should have ghc version 7.8.4 and cabal
version 1.18. Earlier versions of cabal will not work. We cannot know
what will happen with later versions of ghc or cabal.

Use cabal to install alex and happy globally if not done already:
```cabal install alex happy```

To initialize the sandbox environment, cd into the project directory and
use the following shell commands:
```
wget https://www.stackage.org/lts/cabal.config
cabal sandbox init
cabal update
```
