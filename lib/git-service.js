
const path = require('path');

class GitService {

    constructor(params) {
        this._changedFileListParser = params.changedFileListParser;
        this._configStore = params.configStore;
        this._shellCommandRunner = params.shellCommandRunner;
        this._gitBlameOutputParser = params.gitBlameOutputParser;
    }

    getBlame(filePath, commitHash, repositoryRoot) {
        const options = {cwd: repositoryRoot};
        const extraBlameOptions = this._ignoreWhitespaceOnBlame ? ['-w'] : [];
        const commitHashArg = commitHash ? [commitHash] : [];
        const args = ['blame', ...extraBlameOptions, '--line-porcelain', ...commitHashArg, '--', filePath];
        return this._shellCommandRunner.run(this._gitPath, args, options)
            .then(output => this._gitBlameOutputParser.parse(output));
    }

    getChangedFilesInCommit(commitHash, repositoryRoot) {
        const options = {cwd: repositoryRoot};
        const args = ['diff-tree', commitHash, '--name-status', '--parents', '--root', '-M', '-r'];
        return this._shellCommandRunner.run(this._gitPath, args, options)
            .then(output => this._changedFileListParser.parse(output));
    }

    getFileContents(commit, filePath, repositoryRoot) {
        const options = {cwd: repositoryRoot};
        return this._shellCommandRunner.run(this._gitPath, ['show', `${commit}:${filePath}`], options);
    }

    getRepositoryRoot(filePath) {
        const options = {cwd: path.dirname(filePath)};
        return this._shellCommandRunner.run(this._gitPath, ['rev-parse', '--show-toplevel'], options)
            .then(repositoryRoot => repositoryRoot.trim());
    }

    get _gitPath() {
        return this._configStore.getGitConfig('path') || 'git';
    }

    get _ignoreWhitespaceOnBlame() {
        return this._configStore.getExtensionConfig('git.ignoreWhitespaceOnBlame');
    }

}

module.exports = GitService;
