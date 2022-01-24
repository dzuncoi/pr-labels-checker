const core = require('@actions/core');
const github = require('@actions/github');

async function getPRLabels(octokit) {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const commit_sha = github.context.sha;

  const res = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
    owner,
    repo,
    commit_sha,
  })

  const latestPr = res.data && res.data.length > 0 && res.data[0];
  return latestPr ? latestPr.labels.map(l => l.name) : []
}

function getInputLabels() {
  const raw = core.getInput('labels', { required: true });
  let json
  try {
    json = JSON.parse(raw)
    return Array.isArray(json) ? json : []
  } catch (e) {
    return []
  }
}

async function run() {
  const token = core.getInput('github-token', { required: true });
  const octokit = github.getOctokit(token);

  const prLabels = getPRLabels(octokit);
  const inputLabels = getInputLabels();

  if (inputLabels.some(l => prLabels.includes(l))) core.setOutput('labelsMatched', true)
  core.setFailed(core.ExitCode.Success);
}

run();
