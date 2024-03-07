const axios = require('axios');
const { Command } = require('commander');

/*
  USAGE EXAMPLE:
    node ./update-library-version.js -u edward-fedoruk -p ATBBE96JaBwQSvA2Zk9CuEZeKbT3EDD27C96 -w redocly-package-test -r redocly-package-test -pkg '@redocly/cli' -v 'latest'
*/

const program = new Command();

program
  .option('-u, --username <string>', 'Bitbucket username')
  .option('-p, --password <string>', 'App password')
  .option('-w, --workspace <string>', 'Workspace ID or username')
  .option('-r, --repoSlug <string>', 'Repository slug')
  .option('-pkg, --package <string>', 'Package to update')
  .option('-v, --version <string>', 'Package version');

program.parse(process.argv);

const CLI_OPTIONS = { // TODO: check if all required options set
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
  workspace: process.env.WORKSPACE,
  repoSlug: process.env.REPO_SLUG,
  version: process.env.VERSION,
  package: process.env.PACKAGE,
  ...program.opts(),
}

const bitbucketApi = axios.create({
  baseURL: 'https://api.bitbucket.org/2.0',
  auth: { // TODO: better authorization
    username: CLI_OPTIONS.username,
    password: CLI_OPTIONS.password
  }
});
const basePath = `repositories/${CLI_OPTIONS.workspace}/${CLI_OPTIONS.repoSlug}`

const updatePackage = (packageJson, packageName, version) => {
  // TODO: Would be nice to also update .lock file somehow
  // TODO: Cases when package has been already update 
  // TODO: handle package with Caret(^) and Tilde(~) other cases
  // we can use semver lib to handle package update

  if (!packageJson?.dependencies?.[packageName] && !packageJson?.devDependencies?.[packageName]) process.exit()

  const dependencies = packageJson?.dependencies?.[packageName] 
    ? packageJson.dependencies
    : packageJson.devDependencies

  dependencies[packageName] = version;
  
  return packageJson;
}

const getMainBranchName = async () => {
    const { data: repo } = await bitbucketApi.get(basePath);

    return repo.mainbranch.name;
};

const getJsonFile = async (branch) => {
  // TODO: package.json could be not in the roo. What if monorepo learna/turborepo
  const packageJsonPath = `${basePath}/src/${branch}/package.json`;
  const { data: packageJson } = await bitbucketApi.get(packageJsonPath)

  return packageJson
}

const createBranchForUpdate = async (branch) => {
  const branchName = `redocly-packages-update-${Date.now()}`;
  await bitbucketApi.post(`${basePath}/refs/branches`, {
    name: branchName,
    target: {
      hash: branch
    }
  })

  return branchName;
}

const makeCommitWithNewPackage = async (branchName, updatedPackage) => {
  const params = new URLSearchParams();
  params.append('message', 'Update package.json');
  params.append('branch', branchName);
  params.append('package.json', JSON.stringify(updatedPackage, null, 2));

  await bitbucketApi.post(`${basePath}/src`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

const createPr = async (branchName) => {
  await bitbucketApi.post(`${basePath}/pullrequests`, {
    title: '🚀🚀🚀 Redocly npm package update 🚀🚀🚀',
    source: {
      branch: {
        name: branchName
      }
    },
    destination: {
      branch: {
        name: 'master'
      }
    },
    // TODO: list updated packages
    description: `
      This is an automated PR to update package.json
      \n package updated: ${CLI_OPTIONS.package}
    `,
    reviewers: []
  })
}

async function main() {
  try {
    const branch = await getMainBranchName();
    const packageJson = await getJsonFile(branch);
    const branchName = await createBranchForUpdate(branch);
    const updatedPackage = updatePackage(packageJson, CLI_OPTIONS.package, CLI_OPTIONS.version);
    await makeCommitWithNewPackage(branchName, updatedPackage);
    await createPr(branchName);

  } catch (error) { // TODO: would be nice to handle on every step and report them
    console.error('Unexpected failure, something wrong with the script', error);
  }
}
if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  updatePackage,
}