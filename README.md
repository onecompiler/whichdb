# WhichDB data

The open dataset behind [whichdb.com](https://whichdb.com): one JSON profile for every database we
can find (active, dead and research systems), with its data model, workloads, architecture,
license, deployment options, features, strengths, trade-offs and alternatives.

This repository holds **data only**. The website's code is not open source.

```
databases/<slug>.json         one profile per database (844 today)
logos/<slug>.webp             full-colour logos for databases without a Simple Icons mark
logos/sources.json            where each logo came from
schema/profile.schema.json    JSON Schema (draft 2020-12) every profile must satisfy
```

[`databases/postgresql.json`](databases/postgresql.json) is the reference example.

## Using the data

Clone the repo, or read files directly:

```
https://raw.githubusercontent.com/onecompiler/whichdb/main/databases/postgresql.json
```

The site also publishes a compact catalog at `https://whichdb.com/data/index.json` and each full
profile at `https://whichdb.com/data/db/<slug>.json`, with rankings mixed in.

Popularity metrics (the WhichDB Score) are not part of this dataset.

## License

The profiles and the schema are licensed under [CC BY 4.0](LICENSE). You may copy, adapt and use
them for any purpose, including commercially, as long as you give credit, for example:

> Data from [WhichDB](https://whichdb.com), licensed under CC BY 4.0.

**Logos are not covered by that license.** Every logo and brand mark is a trademark of its
owner and is included only to identify the database. See [NOTICE](NOTICE).

## Contributing

Spotted something wrong or out of date? Every page on whichdb.com has a *suggest an edit* link
that opens the profile here. Fix it and open a pull request. Read [CONTRIBUTING.md](CONTRIBUTING.md)
first; it explains the fields, how to research a change and how to validate it:

```bash
npm install
npm run validate
```

Merged changes reach whichdb.com within a day.
