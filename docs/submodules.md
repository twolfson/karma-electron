# Submodules
We currently don't support sharing the same `window` context with submodules (e.g. `require('./abc')`). We have a pull request to repair support by making the necessary patches in Karma but it's still under review:

https://github.com/karma-runner/karma/pull/1984

As a workaround, there are a few options:

- Use the patched version of `karma`. This can be done via the following dependencies:

```
"karma": "https://github.com/twolfson/karma/releases/download/dev%2Fpersonal.mix-16718fd/karma-0.13.22.tgz",
"karma-electron": "git://github.com/twolfson/karma-electron#9bdfc93",
```

- Bundle your JavaScript via Browserify or webpack