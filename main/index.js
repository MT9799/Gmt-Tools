const vscode = require('vscode');

function activate(context) {
    vscode.languages.registerCompletionItemProvider('plaintext', {
        provideCompletionItems: (document, position) => {
            return [
                {
                    label: 'Line',
                    insertText: 'Line'
                }
            ]
        }
    }, ['.'])
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
