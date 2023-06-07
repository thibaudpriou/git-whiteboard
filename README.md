# git-whiteboard

Website to create and interact with a graph drawn with HTML canvas.

## Setup

```bash
yarn

yarn dev
# or start the server and open the app in a new browser tab
yarn dev -- --open
```

## Building

To create a production version:

```bash
yarn build
```

---
## TODO list

Graph features:

- implement a real "rebase" action mode
- implement a "cherry-pick" action mode
- implement branches
- merge checks
- disallow root commit deletion

UX/UI:

- refactor +page.selte view
- define actions presets to show recurrent Git manipulations: /learn route
- enhance UX and help text

Technical debt:

- simplify commit.parents: as an array i.o. tuple
- refactor rebase/unbase (if not yet deleted)
- unit tests
