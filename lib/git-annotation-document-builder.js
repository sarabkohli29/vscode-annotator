
'use strict';

const _ = require('lodash');
const Const = require('./const');

class GitAnnotationDocumentBuilder {

    constructor(params) {
        this._annotationStyleBuilder = params.annotationStyleBuilder;
    }

    build(lineBlames, repositoryRootPath) {
        const body = lineBlames.map(lineBlame => this._getHtmlLine(lineBlame, repositoryRootPath)).join('');
        const css = this._annotationStyleBuilder.build();
        return `<style>${css}</style><body>${body}</body>`;
    }

    _getHtmlLine(lineBlame, repositoryRootPath) {
        const date = new Date(lineBlame.authorTime * 1000);
        return [
            /* eslint-disable indent */
            '<div class="line">',
                '<div class="annotation truncate">',
                    this._getLink(lineBlame, repositoryRootPath), '&nbsp;',
                    `<span>${this._getDateString(date)} ${lineBlame.authorName}</span>`,
                '</div>',
                `<pre>${this._getEscapedContents(lineBlame.lineContents)}</pre>`,
            '</div>'
            /* eslint-enable indent */
        ].join('');
    }

    _getEscapedContents(text) {
        return text.split('<').join('&lt;');
    }

    _getDateString(date) {
        const pad0 = n => n < 10 ? `0${n}` : n;
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(pad0).join('-');
    }

    _getLink(lineBlame, repositoryRootPath) {
        if (/^0+$/.test(lineBlame.commitHash)) return '------';

        const embedBlameInfo = _.pick(lineBlame, [
            'commitHash', 'filename', 'previousCommitHash', 'previousFilename'
        ]);
        const args = [embedBlameInfo, repositoryRootPath];
        const encodedCommand = encodeURI(`command:${Const.EXTENSION_NAME}.takeDiff?${JSON.stringify(args)}`);
        return `<a href="${encodedCommand}" class="commit-link">${lineBlame.commitHash.slice(0, 6)}</a>`;
    }
}

module.exports = GitAnnotationDocumentBuilder;