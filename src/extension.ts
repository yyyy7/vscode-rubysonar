// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as net from 'net';
import { LanguageClient, LanguageClientOptions, ServerOptions, Middleware, } from 'vscode-languageclient';
import { workspace } from 'vscode';

let client: LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context: { asAbsolutePath: (arg0: string) => void; subscriptions: vscode.Disposable[]; }) {

	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	var selectClient = function(): ServerOptions { 
	      return () =>  {
					return new Promise( (resolve) => {
												let socket = net.createConnection(8888, 'localhost');
			                  resolve({
			                  	reader: socket,
			                  	writer: socket
												});
											} );
										};
									};
										

	let clientOptions = {
		documentSelector: [{ scheme: 'file', language: 'ruby' }],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('{**/*.rb}')
		}
	};
	let serverOptions = selectClient();

	client = new LanguageClient(
		'vsc-rubysonar',
		serverOptions,
		clientOptions
	);


	context.subscriptions.push(client.start());

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
};
