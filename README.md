# Bitbucket Version Updater

## Overview

This script automates the process of updating npm package inside a  `package.json` file in a Bitbucket repository. It leverages the Bitbucket API to fetch and update the `package.json`, create a new branch for the changes, commit the updated `package.json`, and finally, create a pull request for the change.

## Prerequisites

- Node.js installed
- A Bitbucket account with access to the target repository.
- Bitbucket App Password generated with write permissions.

## Installation

```bash
npm install
```

## CLI parameters
- -u, --username <string>: Bitbucket username.
- -p, --password <string>: Bitbucket App Password.
- -w, --workspace <string>: Workspace ID.
- -r, --repoSlug <string>: Repository slug.
- -pkg, --package <string>: Npm package name.
- -v, --version <string>: The new version for the npm package.

## Environment variables
- USER_NAME='user'
- PASSWORD='ASDF2E1QD1'
- WORKSPACE='workspace'
- REPO_SLUG='slug'
- PACKAGE='react'
- VERSION='16.0.0'

## Usage example
```bash
node ./update-library-version.js -u edward-fedoruk -p ATBBE96JaBwQSvA2Zk9CuEZeKbT3EDD27C96 -w redocly-package-test -r redocly-package-test -pkg '@redocly/cli' -v 'latest'
```
